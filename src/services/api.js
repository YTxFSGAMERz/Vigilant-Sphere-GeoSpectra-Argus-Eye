// src/services/api.js — Enhanced Data Service Layer

const RSS_PROXY = 'https://api.allorigins.win/raw?url=';

export class APIService {

    // ═══════════════════════════════════════════════
    //  FLIGHTS — OpenSky Network
    // ═══════════════════════════════════════════════
    static async fetchFlights() {
        try {
            const res = await fetch('https://opensky-network.org/api/states/all');
            if (!res.ok) throw new Error('OpenSky API Error');
            const data = await res.json();
            return (data.states || []).slice(0, 1000).map(s => ({
                icao24: s[0],
                callsign: (s[1] || '').trim(),
                originCountry: s[2],
                longitude: s[5],
                latitude: s[6],
                altitude: s[7] || s[13],
                velocity: s[9],
                heading: s[10]
            })).filter(f => f.longitude != null && f.latitude != null);
        } catch (e) {
            console.warn('[API] Flight fetch failed, using mock:', e.message);
            return Array.from({ length: 40 }).map((_, i) => ({
                icao24: `mock${i}`, callsign: `FLT-00${i}`, originCountry: 'System',
                longitude: -125 + Math.random() * 55, latitude: 25 + Math.random() * 25,
                altitude: 8000 + Math.random() * 4000, velocity: 200 + Math.random() * 50,
                heading: Math.random() * 360
            }));
        }
    }

    // ═══════════════════════════════════════════════
    //  SATELLITES — CelesTrak TLE
    // ═══════════════════════════════════════════════
    static async fetchSatellites() {
        try {
            const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle');
            if (!res.ok) throw new Error('CelesTrak API Error');
            return this.parseTLE(await res.text());
        } catch (e) {
            console.warn('[API] Satellite fetch failed, using mock:', e.message);
            return Array.from({ length: 40 }).map((_, i) => ({
                noradId: `S-${i}`, name: `ORB-${i}`,
                latitude: (Math.random() - 0.5) * 160, longitude: (Math.random() - 0.5) * 360,
                altitude: 400 + Math.random() * 1000
            }));
        }
    }

    // ═══════════════════════════════════════════════
    //  EARTHQUAKES — USGS GeoJSON Feed
    // ═══════════════════════════════════════════════
    static async fetchEarthquakes() {
        try {
            const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
            if (!res.ok) throw new Error('USGS API Error');
            const data = await res.json();
            return (data.features || []).map(f => ({
                id: f.id, magnitude: f.properties.mag, place: f.properties.place,
                time: f.properties.time, longitude: f.geometry.coordinates[0],
                latitude: f.geometry.coordinates[1], depth: f.geometry.coordinates[2]
            }));
        } catch (e) {
            console.warn('[API] Earthquake fetch failed:', e.message);
            return [];
        }
    }

    // ═══════════════════════════════════════════════
    //  WEATHER ALERTS — NWS Active Alerts
    // ═══════════════════════════════════════════════
    static async fetchWeatherAlerts() {
        try {
            const res = await fetch('https://api.weather.gov/alerts/active', {
                headers: { 'User-Agent': 'VigilantSphere/1.0' }
            });
            if (!res.ok) throw new Error(`NWS API Error: ${res.status}`);
            const data = await res.json();
            return (data.features || [])
                .filter(a => a.properties.severity !== 'Unknown')
                .slice(0, 50)
                .map(a => {
                    const coords = this._extractCoords(a.geometry);
                    return {
                        id: a.id,
                        event: a.properties.event,
                        severity: a.properties.severity,
                        headline: a.properties.headline,
                        description: (a.properties.description || '').slice(0, 500),
                        areaDesc: a.properties.areaDesc,
                        onset: a.properties.onset,
                        expires: a.properties.expires,
                        coordinates: coords,
                        centroid: this._centroid(coords)
                    };
                });
        } catch (e) {
            console.warn('[API] Weather alerts fetch failed:', e.message);
            return [];
        }
    }

    // ═══════════════════════════════════════════════
    //  NASA EONET — Natural Events (volcanoes, storms, etc.)
    // ═══════════════════════════════════════════════
    static async fetchNaturalEvents() {
        try {
            const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50');
            if (!res.ok) throw new Error('EONET API Error');
            const data = await res.json();
            return (data.events || []).map(ev => {
                const geo = ev.geometry?.[0];
                return {
                    id: ev.id,
                    title: ev.title,
                    category: ev.categories?.[0]?.title || 'Unknown',
                    categoryId: ev.categories?.[0]?.id || 'other',
                    latitude: geo?.coordinates?.[1] ?? 0,
                    longitude: geo?.coordinates?.[0] ?? 0,
                    date: geo?.date || ev.geometry?.[0]?.date,
                    source: ev.sources?.[0]?.url
                };
            }).filter(e => e.latitude && e.longitude);
        } catch (e) {
            console.warn('[API] EONET fetch failed:', e.message);
            return [];
        }
    }

    // ═══════════════════════════════════════════════
    //  NASA FIRMS — Active Wildfires (CSV)
    // ═══════════════════════════════════════════════
    static async fetchWildfires() {
        try {
            // FIRMS VIIRS 24h world summary
            const res = await fetch('https://firms.modaps.eosdis.nasa.gov/api/area/csv/d80525af6e5ceec54ec7a4ab87c13766/VIIRS_SNPP_NRT/world/1');
            if (!res.ok) throw new Error('FIRMS API Error');
            const text = await res.text();
            const lines = text.trim().split('\n');
            const header = lines[0].split(',');
            const latIdx = header.indexOf('latitude');
            const lonIdx = header.indexOf('longitude');
            const brIdx = header.indexOf('bright_ti4');
            const frpIdx = header.indexOf('frp');
            const dateIdx = header.indexOf('acq_date');

            return lines.slice(1, 201).map(line => {
                const cols = line.split(',');
                return {
                    latitude: parseFloat(cols[latIdx]),
                    longitude: parseFloat(cols[lonIdx]),
                    brightness: parseFloat(cols[brIdx]) || 0,
                    frp: parseFloat(cols[frpIdx]) || 0,
                    date: cols[dateIdx] || ''
                };
            }).filter(f => !isNaN(f.latitude) && !isNaN(f.longitude));
        } catch (e) {
            console.warn('[API] Wildfires fetch failed:', e.message);
            return [];
        }
    }

    // ═══════════════════════════════════════════════
    //  INTERNET OUTAGES — Cloudflare Radar
    // ═══════════════════════════════════════════════
    static async fetchInternetOutages() {
        try {
            const res = await fetch('https://api.cloudflare.com/client/v4/radar/annotations/outages?limit=20&format=json');
            if (!res.ok) throw new Error('Cloudflare Radar Error');
            const data = await res.json();
            return (data.result?.annotations || []).map(o => ({
                id: o.id || `outage-${Math.random().toString(36).slice(2)}`,
                description: o.description || 'Internet Disruption',
                country: o.locations?.[0] || 'Unknown',
                startDate: o.startDate,
                endDate: o.endDate,
                scope: o.scope || 'regional',
                asns: o.asns || []
            }));
        } catch (e) {
            console.warn('[API] Outages fetch failed:', e.message);
            return [];
        }
    }

    // ═══════════════════════════════════════════════
    //  RSS FEED PARSER — Universal (via CORS proxy)
    // ═══════════════════════════════════════════════
    static async fetchRSS(feedUrl, sourceName = 'Unknown') {
        try {
            const proxyUrl = `${RSS_PROXY}${encodeURIComponent(feedUrl)}`;
            const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) throw new Error(`RSS proxy error: ${res.status}`);
            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');

            // Handle RSS 2.0 and Atom
            const items = xml.querySelectorAll('item, entry');
            return Array.from(items).slice(0, 20).map(item => {
                const title = item.querySelector('title')?.textContent?.trim() || '';
                const link = item.querySelector('link')?.textContent?.trim() ||
                    item.querySelector('link')?.getAttribute('href') || '';
                const pubDate = item.querySelector('pubDate, published, updated')?.textContent?.trim();
                const description = item.querySelector('description, summary, content')?.textContent?.trim() || '';
                // Extract image
                const imageUrl = this._extractRSSImage(item);

                return {
                    title,
                    link,
                    source: sourceName,
                    pubDate: pubDate ? new Date(pubDate) : new Date(),
                    description: description.replace(/<[^>]+>/g, '').slice(0, 300),
                    imageUrl,
                    threatLevel: this._classifyThreat(title + ' ' + description)
                };
            });
        } catch (e) {
            console.warn(`[RSS] Failed to fetch ${sourceName}:`, e.message);
            return [];
        }
    }

    // ═══════════════════════════════════════════════
    //  INTEL FEED — Aggregated from multiple RSS sources
    // ═══════════════════════════════════════════════
    static async fetchIntelFeed() {
        const sources = [
            { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
            { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
            { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
            { name: 'Defense One', url: 'https://www.defenseone.com/rss/' },
            { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
        ];
        const results = await Promise.allSettled(
            sources.map(s => this.fetchRSS(s.url, s.name))
        );
        const allItems = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value);
        // Sort by date, newest first
        allItems.sort((a, b) => b.pubDate - a.pubDate);
        return allItems.slice(0, 50);
    }

    // ═══════════════════════════════════════════════
    //  GDELT — Global Event Monitoring
    // ═══════════════════════════════════════════════
    static async fetchGDELTEvents(query = 'conflict OR military OR attack') {
        try {
            const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=20&format=json`;
            const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
            if (!res.ok) throw new Error('GDELT API Error');
            const data = await res.json();
            return (data.articles || []).map(a => ({
                title: a.title || '',
                url: a.url || '',
                source: a.domain || 'Unknown',
                language: a.language || 'en',
                seenDate: a.seendate || '',
                socialImage: a.socialimage || '',
                tone: a.tone ? parseFloat(a.tone) : 0
            }));
        } catch (e) {
            console.warn('[API] GDELT fetch failed:', e.message);
            return [];
        }
    }

    // ═══════════════════════════════════════════════
    //  HELPER: TLE Parser
    // ═══════════════════════════════════════════════
    static parseTLE(tleText) {
        const lines = tleText.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const satellites = [];
        for (let i = 0; i < lines.length; i += 3) {
            if (i + 2 >= lines.length) break;
            const name = lines[i];
            const line1 = lines[i + 1];
            const noradId = line1.substring(2, 7).trim();
            const hash = parseInt(noradId, 10);
            satellites.push({
                noradId, name,
                latitude: (hash % 180) - 90,
                longitude: ((hash * 13) % 360) - 180,
                altitude: 400 + (hash % 1000)
            });
        }
        return satellites;
    }

    // ═══════════════════════════════════════════════
    //  HELPER: Extract coordinates from GeoJSON geometry
    // ═══════════════════════════════════════════════
    static _extractCoords(geometry) {
        if (!geometry) return [];
        try {
            if (geometry.type === 'Polygon') {
                return geometry.coordinates[0]?.map(c => [c[0], c[1]]) || [];
            }
            if (geometry.type === 'MultiPolygon') {
                return geometry.coordinates[0]?.[0]?.map(c => [c[0], c[1]]) || [];
            }
        } catch { return []; }
        return [];
    }

    // ═══════════════════════════════════════════════
    //  HELPER: Calculate centroid of coordinate array
    // ═══════════════════════════════════════════════
    static _centroid(coords) {
        if (!coords.length) return null;
        const sum = coords.reduce((a, [lon, lat]) => [a[0] + lon, a[1] + lat], [0, 0]);
        return [sum[0] / coords.length, sum[1] / coords.length];
    }

    // ═══════════════════════════════════════════════
    //  HELPER: Extract image from RSS item
    // ═══════════════════════════════════════════════
    static _extractRSSImage(item) {
        // Try media:content
        const mediaContent = item.querySelector('content[url]');
        if (mediaContent) return mediaContent.getAttribute('url');
        // Try media:thumbnail
        const mediaThumbnail = item.querySelector('thumbnail[url]');
        if (mediaThumbnail) return mediaThumbnail.getAttribute('url');
        // Try enclosure
        const enclosure = item.querySelector('enclosure[type^="image"]');
        if (enclosure) return enclosure.getAttribute('url');
        // Try img in description
        const desc = item.querySelector('description, content')?.textContent || '';
        const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)/);
        return imgMatch ? imgMatch[1] : null;
    }

    // ═══════════════════════════════════════════════
    //  HELPER: Keyword-based threat classification
    // ═══════════════════════════════════════════════
    static _classifyThreat(text) {
        const lower = text.toLowerCase();
        const CRITICAL = ['nuclear', 'wmd', 'defcon', 'missile launch', 'biological weapon', 'chemical attack', 'invasion', 'declaration of war'];
        const HIGH = ['attack', 'strike', 'killed', 'bombing', 'explosion', 'casualties', 'airstrike', 'drone strike', 'assassination', 'coup', 'martial law'];
        const ELEVATED = ['military', 'troops', 'sanctions', 'conflict', 'tensions', 'escalation', 'deployment', 'naval', 'embargo', 'missile', 'protest'];
        const GUARDED = ['elections', 'diplomacy', 'summit', 'trade war', 'cyber', 'intelligence', 'surveillance', 'espionage'];

        if (CRITICAL.some(k => lower.includes(k))) return 'CRITICAL';
        if (HIGH.some(k => lower.includes(k))) return 'HIGH';
        if (ELEVATED.some(k => lower.includes(k))) return 'ELEVATED';
        if (GUARDED.some(k => lower.includes(k))) return 'GUARDED';
        return 'LOW';
    }
}
