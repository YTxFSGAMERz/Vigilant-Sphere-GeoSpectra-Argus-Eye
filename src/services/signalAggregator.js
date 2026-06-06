// src/services/signalAggregator.js
// Collects all map signals and correlates them by country/region
// Feeds geographic context to AI Insights (GEO-AI UPLINK)

const REGION_DEFINITIONS = {
    middle_east: {
        name: 'Middle East',
        countries: ['IR', 'IL', 'SA', 'AE', 'IQ', 'SY', 'YE', 'JO', 'LB', 'KW', 'QA', 'OM', 'BH']
    },
    east_asia: {
        name: 'East Asia',
        countries: ['CN', 'TW', 'JP', 'KR', 'KP', 'PH', 'VN']
    },
    eastern_europe: {
        name: 'Eastern Europe',
        countries: ['UA', 'RU', 'BY', 'PL', 'RO', 'MD', 'LT', 'LV', 'EE']
    },
    africa_north: {
        name: 'North Africa',
        countries: ['EG', 'LY', 'DZ', 'TN', 'MA', 'SD', 'SS']
    },
    africa_sahel: {
        name: 'Sahel Region',
        countries: ['ML', 'NE', 'BF', 'TD', 'NG', 'CM', 'CF']
    },
    south_asia: {
        name: 'South Asia',
        countries: ['IN', 'PK', 'AF', 'BD', 'LK', 'NP']
    }
};

export class SignalAggregator {
    constructor() {
        this.signals = [];
        this.WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
    }

    // ── Ingest earthquake events ──
    ingestEarthquakes(quakes) {
        this._clearType('earthquake');
        for (const q of quakes) {
            if (!q.latitude || !q.longitude) continue;
            this.signals.push({
                type: 'earthquake',
                lat: q.latitude,
                lon: q.longitude,
                severity: q.magnitude >= 6 ? 'high' : q.magnitude >= 4 ? 'medium' : 'low',
                title: `M${q.magnitude?.toFixed(1)} ${q.place || ''}`,
                timestamp: new Date(q.time || Date.now())
            });
        }
    }

    // ── Ingest weather alerts ──
    ingestWeatherAlerts(alerts) {
        this._clearType('weather');
        for (const a of alerts) {
            const c = a.centroid;
            if (!c) continue;
            this.signals.push({
                type: 'weather',
                lat: c[1], lon: c[0],
                severity: a.severity === 'Extreme' ? 'high' : a.severity === 'Severe' ? 'medium' : 'low',
                title: `${a.severity}: ${a.event}`,
                timestamp: new Date(a.onset || Date.now())
            });
        }
    }

    // ── Ingest military flights ──
    ingestFlights(flights) {
        this._clearType('military_flight');
        const militaryCallsigns = /^(RCH|RRR|REACH|DUKE|EVAC|SAM|SPAR|N[0-9]{5}|FORTE|SIGINT|HOMER)/i;
        for (const f of flights) {
            if (!militaryCallsigns.test(f.callsign) && !['United States', 'Russia', 'China'].includes(f.originCountry)) continue;
            this.signals.push({
                type: 'military_flight',
                lat: f.latitude, lon: f.longitude,
                severity: 'medium',
                title: `MIL FLT: ${f.callsign || f.icao24}`,
                timestamp: new Date()
            });
        }
    }

    // ── Ingest natural events (NASA EONET) ──
    ingestNaturalEvents(events) {
        this._clearType('natural_event');
        for (const e of events) {
            this.signals.push({
                type: 'natural_event',
                lat: e.latitude, lon: e.longitude,
                severity: e.categoryId === 'severeStorms' ? 'high' : 'medium',
                title: `${e.category}: ${e.title}`,
                timestamp: new Date(e.date || Date.now())
            });
        }
    }

    // ── Ingest wildfires (NASA FIRMS) ──
    ingestWildfires(fires) {
        this._clearType('wildfire');
        // Cluster fires into grids of 1 degree
        const grid = new Map();
        for (const f of fires) {
            const key = `${Math.round(f.latitude)},${Math.round(f.longitude)}`;
            if (!grid.has(key)) grid.set(key, { count: 0, totalFRP: 0, lat: f.latitude, lon: f.longitude });
            const g = grid.get(key);
            g.count++;
            g.totalFRP += f.frp;
        }
        for (const [, g] of grid) {
            this.signals.push({
                type: 'wildfire',
                lat: g.lat, lon: g.lon,
                severity: g.count > 20 ? 'high' : g.count > 5 ? 'medium' : 'low',
                title: `${g.count} fires, FRP ${g.totalFRP.toFixed(0)}MW`,
                timestamp: new Date()
            });
        }
    }

    // ── Ingest internet outages ──
    ingestOutages(outages) {
        this._clearType('internet_outage');
        for (const o of outages) {
            this.signals.push({
                type: 'internet_outage',
                lat: 0, lon: 0, // Country-level, no coords
                severity: o.scope === 'national' ? 'high' : 'medium',
                title: `OUTAGE: ${o.country} - ${o.description}`,
                timestamp: new Date(o.startDate || Date.now()),
                country: o.country
            });
        }
    }

    // ── Ingest breaking news ──
    ingestNewsItems(items) {
        this._clearType('breaking_news');
        for (const item of items) {
            if (item.threatLevel === 'CRITICAL' || item.threatLevel === 'HIGH') {
                this.signals.push({
                    type: 'breaking_news',
                    lat: 0, lon: 0,
                    severity: item.threatLevel === 'CRITICAL' ? 'high' : 'medium',
                    title: `[${item.source}] ${item.title}`,
                    timestamp: item.pubDate || new Date()
                });
            }
        }
    }

    // ── Get all signals ──
    getAllSignals() {
        this._pruneOld();
        return [...this.signals];
    }

    // ── Get signal count by type ──
    getCountByType() {
        const counts = {};
        for (const s of this.signals) {
            counts[s.type] = (counts[s.type] || 0) + 1;
        }
        return counts;
    }

    // ── Get high-severity signals ──
    getHighSeverity() {
        return this.signals.filter(s => s.severity === 'high');
    }

    // ── Generate AI context string ──
    generateAIContext() {
        this._pruneOld();
        const counts = this.getCountByType();
        const highSev = this.getHighSeverity();

        let ctx = `SIGNAL SUMMARY (${this.signals.length} total):\n`;
        for (const [type, count] of Object.entries(counts)) {
            ctx += `  ${type.toUpperCase()}: ${count}\n`;
        }
        if (highSev.length > 0) {
            ctx += `\nHIGH SEVERITY ALERTS:\n`;
            for (const s of highSev.slice(0, 10)) {
                ctx += `  ⚠ ${s.title}\n`;
            }
        }

        // Regional convergence
        const convergence = this._getRegionalConvergence();
        if (convergence.length > 0) {
            ctx += `\nCONVERGENCE ZONES:\n`;
            for (const c of convergence) {
                ctx += `  ${c.region}: ${c.totalSignals} signals (${c.signalTypes.join(', ')})\n`;
            }
        }

        return ctx;
    }

    // ── Regional convergence detection ──
    _getRegionalConvergence() {
        const results = [];
        for (const [regionId, def] of Object.entries(REGION_DEFINITIONS)) {
            const regionSignals = this.signals.filter(s =>
                s.country && def.countries.includes(s.country)
            );
            if (regionSignals.length >= 3) {
                const types = [...new Set(regionSignals.map(s => s.type))];
                results.push({
                    region: def.name,
                    totalSignals: regionSignals.length,
                    signalTypes: types,
                    description: `${types.length} signal types converging in ${def.name}`
                });
            }
        }
        return results.sort((a, b) => b.totalSignals - a.totalSignals);
    }

    // ── Private helpers ──
    _clearType(type) {
        this.signals = this.signals.filter(s => s.type !== type);
    }

    _pruneOld() {
        const cutoff = Date.now() - this.WINDOW_MS;
        this.signals = this.signals.filter(s => s.timestamp.getTime() > cutoff);
    }

    clear() {
        this.signals = [];
    }

    getSignalCount() {
        return this.signals.length;
    }
}

export const signalAggregator = new SignalAggregator();
