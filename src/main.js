// src/main.js
import { Terra5Globe } from './globe.js';
import { APIService } from './services/api.js';
import { MockService } from './services/mock.js';
import { MAP_DATA } from './services/mapData.js';
import { signalAggregator } from './services/signalAggregator.js';

class AppController {
  constructor() {
    this.globe = new Terra5Globe('cesiumContainer');
    this.timers = {};
    this.state = {
      layers: {
        flights: true, satellites: true, earthquakes: true, weather: true, cctv: true,
        nuclear: false, military: false, conflicts: true,
        hotspots: true, waterways: false, cables: false,
        naturalEvents: false, wildfires: false, weatherAlerts: false,
        spaceports: false, economic: false
      },
      mode: 'normal',
      sidebarOpen: true,
      panopticEnabled: false,
      camera: { lat: 38.9072, lon: -77.0369, alt: 10000000 }
    };

    // DOM Elements
    this.ui = {
      sidebar: document.getElementById('sidebar'),
      btnToggleSidebar: document.getElementById('toggle-sidebar-btn'),
      deg: document.getElementById('hud-deg'),
      mgrs: document.getElementById('hud-mgrs'),
      gsd: document.getElementById('hud-gsd'),
      niirs: document.getElementById('hud-niirs'),
      altM: document.getElementById('hud-alt-m'),
      timestamp: document.getElementById('recording-timestamp'),
      layerBtns: document.querySelectorAll('.toggle-btn'),
      modeBtns: document.querySelectorAll('.mode-btn'),
      cityBtns: document.querySelectorAll('.city-btn'),
      counts: {
        flights: document.getElementById('count-flights'),
        satellites: document.getElementById('count-satellites'),
        earthquakes: document.getElementById('count-earthquakes'),
        weather: document.getElementById('count-weather'),
        cctv: document.getElementById('count-cctv'),
        nuclear: document.getElementById('count-nuclear'),
        military: document.getElementById('count-military'),
        conflicts: document.getElementById('count-conflicts')
      },
      targetDetails: document.getElementById('target-details'),
      targetContent: document.getElementById('target-content'),
      closeTargetBtn: document.getElementById('close-target-btn'),
      cctvPopup: document.getElementById('cctv-popup'),
      cctvClose: document.querySelector('.cctv-close'),
      cctvId: document.getElementById('cctv-id'),
      cctvName: document.getElementById('cctv-name'),
      status: document.getElementById('status-text'),

      // New Elements
      btnPizzint: document.getElementById('btn-pizzint'),
      pizzintPanel: document.getElementById('pizzint-panel'),
      closePizzintBtn: document.getElementById('close-pizzint-btn'),
      btnLiveNews: document.getElementById('btn-live-news'),
      newsFeedPanel: document.getElementById('news-feed-panel'),
      closeNewsBtn: document.getElementById('close-news-btn'),
      newsBtns: document.querySelectorAll('.news-btn'),
      newsIframe: document.getElementById('news-iframe'),
      aiInsightsText: document.getElementById('ai-insights-text'),

      // Phase 3 New Elements
      btnIntelFeed: document.getElementById('btn-intel-feed'),
      intelFeedPanel: document.getElementById('intel-feed-panel'),
      closeIntelFeed: document.getElementById('close-intel-feed'),
      intelFeedList: document.getElementById('intel-feed-list'),
      breakingNewsTicker: document.getElementById('breaking-news-ticker'),
      tickerText: document.getElementById('ticker-text'),
      worldClock: document.getElementById('world-clock'),
      clockDC: document.getElementById('clock-dc'),
      clockLON: document.getElementById('clock-lon'),
      clockMSK: document.getElementById('clock-msk'),
      clockBEJ: document.getElementById('clock-bej'),
      clockTKY: document.getElementById('clock-tky'),

      // New layer counts
      countHotspots: document.getElementById('count-hotspots'),
      countWaterways: document.getElementById('count-waterways'),
      countCables: document.getElementById('count-cables'),
      countNaturalEvents: document.getElementById('count-naturalEvents'),
      countWildfires: document.getElementById('count-wildfires'),
      countWeatherAlerts: document.getElementById('count-weatherAlerts'),
      countSpaceports: document.getElementById('count-spaceports'),
      countEconomic: document.getElementById('count-economic')
    };
    this.lastAIUpdate = 0;
    this.intelFeedData = [];
  }

  async init() {
    this.loadSettings();

    // Initialize Globe
    this.globe.init();

    // Restore Visual Mode
    this.globe.setVisualMode(this.state.mode);
    this.updateModeUI(this.state.mode);

    // Setup Callbacks
    this.globe.onCameraChange = (cam) => this.onCameraChange(cam);
    this.globe.onEntityClick = (props) => this.onEntityClick(props);
    this.globe.onMapClick = (pos) => {
      this.updateAIInsights(pos, true);
    };
    this.globe.onMouseMove = (pos) => {
      const now = Date.now();
      if (now - this.lastAIUpdate > 150) { // 150ms throttle
        this.updateAIInsights(pos, false);
        this.lastAIUpdate = now;
      }
    };

    // Bind Events
    this.bindEvents();

    // Start Clocks
    setInterval(() => this.updateClock(), 1000);
    this.updateClock();

    // Initial Data Fetch
    await this.fetchAllData();

    // Sync layer visibility — data is loaded for counts, but hidden layers stay invisible
    Object.entries(this.state.layers).forEach(([layer, visible]) => {
      this.globe.setLayerVisibility(layer, visible);
    });

    // Start Timers
    this.timers.flights = setInterval(() => this.fetchLayer('flights'), 15000);
    this.timers.satellites = setInterval(() => this.fetchLayer('satellites'), 60000);
    this.timers.earthquakes = setInterval(() => this.fetchLayer('earthquakes'), 300000);
    this.timers.weather = setInterval(() => this.fetchLayer('weather'), 300000);
    this.timers.cctv = setInterval(() => this.fetchLayer('cctv'), 60000);

    // New timers for additional data
    this.timers.naturalEvents = setInterval(() => this.fetchLayer('naturalEvents'), 600000);
    this.timers.wildfires = setInterval(() => this.fetchLayer('wildfires'), 600000);
    this.timers.weatherAlerts = setInterval(() => this.fetchLayer('weatherAlerts'), 300000);
    this.timers.intelFeed = setInterval(() => this.refreshIntelFeed(), 300000);

    // World clock
    setInterval(() => this.updateWorldClock(), 1000);
    this.updateWorldClock();

    // Initial intel feed
    this.refreshIntelFeed();

    // Start Mock PANOPTIC
    setInterval(() => {
      if (this.state.panopticEnabled) {
        const dets = MockService.generateDetections(this.state.camera.lat, this.state.camera.lon);
        MockService.renderDetectionsUI(dets);
      } else {
        MockService.clearDetectionsUI();
      }
    }, 2000);

    // Fly to saved position
    if (this.state.camera.lat) {
      this.globe.flyTo(this.state.camera.lat, this.state.camera.lon, this.state.camera.alt, 0);
    }
  }

  bindEvents() {
    // Prevent Context Menu (Right Click)
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Sidebar Toggle
    this.ui.btnToggleSidebar.addEventListener('click', () => this.toggleSidebar());

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Block DevTools shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
      ) {
        e.preventDefault();
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        if (e.key === '[') {
          e.preventDefault();
          this.toggleSidebar();
        } else if (!e.shiftKey && e.key.toLowerCase() === 'p') {
          e.preventDefault();
          this.state.panopticEnabled = !this.state.panopticEnabled;
        }
      }
    });

    // Layer Toggles
    this.ui.layerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const layerDiv = e.target.closest('.layer-toggle');
        const layerName = layerDiv.dataset.layer;
        this.toggleLayer(layerName);
      });
    });

    // Visual Mode Toggles
    this.ui.modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        this.setMode(mode);
      });
    });

    // City Presets
    this.ui.cityBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const { lat, lon, alt } = e.target.dataset;
        this.globe.flyTo(parseFloat(lat), parseFloat(lon), parseFloat(alt));
      });
    });

    // Target Closure
    this.ui.closeTargetBtn.addEventListener('click', () => {
      this.ui.targetDetails.classList.add('hidden');
    });

    if (this.ui.cctvClose) {
      this.ui.cctvClose.addEventListener('click', () => {
        this.ui.cctvPopup.classList.add('hidden');
      });
    }

    // PizzINT Events
    if (this.ui.btnPizzint) {
      this.ui.btnPizzint.addEventListener('click', () => {
        this.ui.pizzintPanel.classList.toggle('hidden');
      });
    }
    if (this.ui.closePizzintBtn) {
      this.ui.closePizzintBtn.addEventListener('click', () => {
        this.ui.pizzintPanel.classList.add('hidden');
      });
    }

    // News Events
    if (this.ui.btnLiveNews) {
      this.ui.btnLiveNews.addEventListener('click', () => {
        this.ui.newsFeedPanel.classList.toggle('hidden');
        if (!this.ui.newsFeedPanel.classList.contains('hidden') && !this.ui.newsIframe.src) {
          this.setNewsChannel('aljazeera');
        }
      });
    }
    if (this.ui.closeNewsBtn) {
      this.ui.closeNewsBtn.addEventListener('click', () => {
        this.ui.newsFeedPanel.classList.add('hidden');
      });
    }
    this.ui.newsBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setNewsChannel(e.target.dataset.channel);
      });
    });

    // Intel Feed Events
    if (this.ui.btnIntelFeed) {
      this.ui.btnIntelFeed.addEventListener('click', () => {
        this.ui.intelFeedPanel.classList.toggle('hidden');
        if (!this.ui.intelFeedPanel.classList.contains('hidden') && this.intelFeedData.length === 0) {
          this.refreshIntelFeed();
        }
      });
    }
    if (this.ui.closeIntelFeed) {
      this.ui.closeIntelFeed.addEventListener('click', () => {
        this.ui.intelFeedPanel.classList.add('hidden');
      });
    }

    // Keyboard shortcuts for new features
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.ui.intelFeedPanel?.classList.add('hidden');
        this.ui.pizzintPanel?.classList.add('hidden');
        this.ui.newsFeedPanel?.classList.add('hidden');
        this.ui.targetDetails?.classList.add('hidden');
      }
    });
  }

  // --- State Actions ---

  toggleSidebar() {
    this.state.sidebarOpen = !this.state.sidebarOpen;
    if (this.state.sidebarOpen) {
      this.ui.sidebar.classList.remove('collapsed');
    } else {
      this.ui.sidebar.classList.add('collapsed');
    }
    this.saveSettings();
  }

  toggleLayer(layerName) {
    this.state.layers[layerName] = !this.state.layers[layerName];
    this.globe.setLayerVisibility(layerName, this.state.layers[layerName]);

    // Fetch data when enabling a layer for the first time
    if (this.state.layers[layerName]) {
      this.fetchLayer(layerName);
    }

    // Update UI
    const btn = document.getElementById(`btn-${layerName}`);
    if (btn) {
      if (this.state.layers[layerName]) {
        btn.classList.add('active');
        btn.textContent = 'ON';
      } else {
        btn.classList.remove('active');
        btn.textContent = 'OFF';
      }
    }
    this.saveSettings();
  }

  setMode(mode) {
    this.state.mode = mode;
    this.globe.setVisualMode(mode);
    this.updateModeUI(mode);
    this.saveSettings();
  }

  updateModeUI(mode) {
    this.ui.modeBtns.forEach(b => b.classList.remove('active'));
    const btn = Array.from(this.ui.modeBtns).find(b => b.dataset.mode === mode);
    if (btn) btn.classList.add('active');
  }

  setNewsChannel(channel) {
    this.ui.newsBtns.forEach(b => b.classList.remove('active'));
    const btn = Array.from(this.ui.newsBtns).find(b => b.dataset.channel === channel);
    if (btn) btn.classList.add('active');

    const streams = {
      aljazeera: 'https://www.youtube.com/embed/bBYNUMCTsHA?autoplay=1&mute=1',
      sky: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1',
      dw: 'https://www.youtube.com/embed/nwyxhe0-U_s?autoplay=1&mute=1',
      nasa: 'https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=1'
    };
    this.ui.newsIframe.src = streams[channel] || streams.aljazeera;
  }

  // --- Data Fetching ---

  async fetchAllData() {
    this.ui.status.textContent = 'UPLINK ESTABLISHED... FETCHING ALL';
    await Promise.all([
      this.fetchLayer('flights'),
      this.fetchLayer('satellites'),
      this.fetchLayer('earthquakes'),
      this.fetchLayer('weather'),
      this.fetchLayer('cctv'),
      this.fetchLayer('nuclear'),
      this.fetchLayer('military'),
      this.fetchLayer('conflicts'),
      // Intel layers — fetch data so counts populate even when hidden
      this.fetchLayer('hotspots'),
      this.fetchLayer('waterways'),
      this.fetchLayer('cables'),
      this.fetchLayer('naturalEvents'),
      this.fetchLayer('wildfires'),
      this.fetchLayer('weatherAlerts'),
      this.fetchLayer('spaceports'),
      this.fetchLayer('economic')
    ]);
    this.ui.status.textContent = 'ALL SYSTEMS NOMINAL';
  }

  async fetchLayer(layer) {
    try {
      if (layer === 'flights') {
        const flights = await APIService.fetchFlights();
        this.globe.updateFlights(flights);
        this.ui.counts.flights.textContent = flights.length.toLocaleString();
      } else if (layer === 'satellites') {
        const sats = await APIService.fetchSatellites();
        this.globe.updateSatellites(sats);
        this.ui.counts.satellites.textContent = sats.length.toLocaleString();
      } else if (layer === 'earthquakes') {
        const eqs = await APIService.fetchEarthquakes();
        this.globe.updateEarthquakes(eqs);
        this.ui.counts.earthquakes.textContent = eqs.length.toLocaleString();
      } else if (layer === 'weather') {
        const wxs = MockService.generateWeatherRadar();
        this.globe.updateWeather(wxs);
        this.ui.counts.weather.textContent = wxs.length.toLocaleString();
      } else if (layer === 'cctv') {
        const cams = MockService.generateCCTV();
        this.globe.updateCCTV(cams);
        this.ui.counts.cctv.textContent = cams.length.toLocaleString();
      } else if (layer === 'nuclear') {
        if (this.globe.updateNuclear) this.globe.updateNuclear(MAP_DATA.NUCLEAR_FACILITIES);
        if (this.ui.counts.nuclear) this.ui.counts.nuclear.textContent = MAP_DATA.NUCLEAR_FACILITIES.length;
      } else if (layer === 'military') {
        if (this.globe.updateMilitary) this.globe.updateMilitary(MAP_DATA.MILITARY_BASES);
        if (this.ui.counts.military) this.ui.counts.military.textContent = MAP_DATA.MILITARY_BASES.length;
      } else if (layer === 'conflicts') {
        if (this.globe.updateConflicts) this.globe.updateConflicts(MAP_DATA.CONFLICT_ZONES);
        if (this.ui.counts.conflicts) this.ui.counts.conflicts.textContent = MAP_DATA.CONFLICT_ZONES.length;
      } else if (layer === 'hotspots') {
        this.globe.updateHotspots(MAP_DATA.INTEL_HOTSPOTS);
        if (this.ui.countHotspots) this.ui.countHotspots.textContent = MAP_DATA.INTEL_HOTSPOTS.length;
      } else if (layer === 'waterways') {
        this.globe.updateWaterways(MAP_DATA.STRATEGIC_WATERWAYS);
        if (this.ui.countWaterways) this.ui.countWaterways.textContent = MAP_DATA.STRATEGIC_WATERWAYS.length;
      } else if (layer === 'cables') {
        this.globe.updateCables(MAP_DATA.UNDERSEA_CABLES);
        if (this.ui.countCables) this.ui.countCables.textContent = MAP_DATA.UNDERSEA_CABLES.length;
      } else if (layer === 'naturalEvents') {
        const events = await APIService.fetchNaturalEvents();
        this.globe.updateNaturalEvents(events);
        signalAggregator.ingestNaturalEvents(events);
        if (this.ui.countNaturalEvents) this.ui.countNaturalEvents.textContent = events.length;
      } else if (layer === 'wildfires') {
        const fires = await APIService.fetchWildfires();
        this.globe.updateWildfires(fires);
        signalAggregator.ingestWildfires(fires);
        if (this.ui.countWildfires) this.ui.countWildfires.textContent = fires.length;
      } else if (layer === 'weatherAlerts') {
        const alerts = await APIService.fetchWeatherAlerts();
        this.globe.updateWeatherAlerts(alerts);
        signalAggregator.ingestWeatherAlerts(alerts);
        if (this.ui.countWeatherAlerts) this.ui.countWeatherAlerts.textContent = alerts.length;
      } else if (layer === 'spaceports') {
        this.globe.updateSpaceports(MAP_DATA.SPACEPORTS);
        if (this.ui.countSpaceports) this.ui.countSpaceports.textContent = MAP_DATA.SPACEPORTS.length;
      } else if (layer === 'economic') {
        this.globe.updateEconomicCenters(MAP_DATA.ECONOMIC_CENTERS);
        if (this.ui.countEconomic) this.ui.countEconomic.textContent = MAP_DATA.ECONOMIC_CENTERS.length;
      }
    } catch (e) {
      console.error(`Error fetching layer ${layer}:`, e);
      this.ui.status.textContent = `WARN: ${layer.toUpperCase()} UPLINK FAILED`;
    }
  }

  // --- Globe Events ---

  onCameraChange(cam) {
    this.state.camera = cam;
    const latStr = (cam.latitude >= 0 ? 'N' : 'S');
    const lonStr = (cam.longitude >= 0 ? 'E' : 'W');

    // Degrees
    const degStr = `${Math.abs(cam.latitude).toFixed(4)}°${latStr} ${Math.abs(cam.longitude).toFixed(4)}°${lonStr}`;
    this.ui.deg.textContent = degStr;

    // MGRS (Simulated)
    const bands = "CDEFGHJKLMNPQRSTUVWX";
    const bandIdx = Math.min(Math.max(Math.floor((cam.latitude + 80) / 8), 0), bands.length - 1);
    const band = bands.charAt(bandIdx);
    const zone = Math.floor((cam.longitude + 180) / 6) + 1;
    const e = Math.floor(Math.abs(cam.longitude % 6) * 100000 / 6).toString().padStart(5, '0');
    const n = Math.floor(Math.abs(cam.latitude % 8) * 100000 / 8).toString().padStart(5, '0');
    this.ui.mgrs.textContent = `MGRS: ${zone.toString().padStart(2, '0')}${band} ${e} ${n}`;

    // Altitude
    let altStr = '';
    if (cam.altitude >= 1000000) altStr = (cam.altitude / 1000000).toFixed(1) + 'M';
    else if (cam.altitude >= 1000) altStr = (cam.altitude / 1000).toFixed(1) + 'K';
    else altStr = Math.floor(cam.altitude) + 'm';
    this.ui.altM.textContent = altStr.toUpperCase();

    // GSD
    const gsd = cam.altitude * 0.00001;
    this.ui.gsd.textContent = (gsd >= 1 ? gsd.toFixed(2) + 'M' : (gsd * 100).toFixed(2) + 'cm').toUpperCase();

    // NIIRS
    const rating = Math.max(0, Math.min(9, 9 - Math.log10(cam.altitude / 1000)));
    this.ui.niirs.textContent = rating.toFixed(1);

    // Debounce saving camera state
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveSettings(), 2000);
  }

  onEntityClick(props) {
    this.ui.targetDetails.classList.remove('hidden');

    // Format properties for UI display
    let html = '';
    if (props.icao24) {
      // Flight
      html += `<h3>TARGET: ${props.callsign || props.icao24}</h3>`;
      html += `<p><strong>TYPE:</strong> AIRCRAFT</p>`;
      html += `<p><strong>ID:</strong> ${props.icao24.toUpperCase()}</p>`;
      html += `<p><strong>ORIGIN:</strong> ${props.originCountry}</p>`;
      html += `<p><strong>VELOCITY:</strong> ${props.velocity ? props.velocity + ' m/s' : 'N/A'}</p>`;
      html += `<p><strong>ALTITUDE:</strong> ${props.altitude ? props.altitude + ' m' : 'N/A'}</p>`;
    } else if (props.noradId) {
      // Satellite
      html += `<h3>TARGET: ${props.name}</h3>`;
      html += `<p><strong>TYPE:</strong> SATELLITE / ORBITAL</p>`;
      html += `<p><strong>NORAD ID:</strong> ${props.noradId}</p>`;
      html += `<p><strong>ALTITUDE:</strong> ${props.altitude ? props.altitude + ' km' : 'N/A'}</p>`;
    } else if (props.magnitude) {
      // Earthquake
      html += `<h3>TARGET: SEISMIC EVENT</h3>`;
      html += `<p><strong>TYPE:</strong> EARTHQUAKE</p>`;
      html += `<p><strong>MAGNITUDE:</strong> M ${parseFloat(props.magnitude).toFixed(1)}</p>`;
      html += `<p><strong>DEPTH:</strong> ${props.depth} km</p>`;
      html += `<p><strong>LOCATION:</strong> ${props.place}</p>`;
      html += `<p><strong>TIME:</strong> ${new Date(props.time).toISOString()}</p>`;
    } else if (props.condition) {
      // Weather Radar
      html += `<h3>TARGET: ${props.name}</h3>`;
      html += `<p><strong>TYPE:</strong> WEATHER RADAR</p>`;
      html += `<p><strong>CONDITION:</strong> ${props.condition.toUpperCase()}</p>`;
      html += `<p><strong>LEVEL:</strong> ${props.precipitationLevel}/4</p>`;
    } else if (props.level) {
      // Intel Hotspot
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> INTEL HOTSPOT</p>`;
      html += `<p class="${props.level === 'high' ? 'text-red' : 'text-cyan'}"><strong>THREAT LEVEL:</strong> ${props.level.toUpperCase()}</p>`;
      html += `<p><strong>INTEL:</strong> ${props.description || 'Classified'}</p>`;
    } else if (props.dailyTraffic) {
      // Strategic Waterway
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> STRATEGIC WATERWAY</p>`;
      html += `<p><strong>TRAFFIC:</strong> ${props.dailyTraffic}</p>`;
      html += `<p><strong>INTEL:</strong> ${props.description || 'Monitored chokepoint'}</p>`;
    } else if (props.capacity) {
      // Undersea Cable
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> UNDERSEA CABLE</p>`;
      html += `<p><strong>CAPACITY:</strong> ${props.capacity}</p>`;
      html += `<p class="text-cyan"><strong>STATUS:</strong> OPERATIONAL</p>`;
    } else if (props.categoryId) {
      // Natural Event (NASA EONET)
      html += `<h3>TARGET: ${(props.title || 'NATURAL EVENT').toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> NATURAL EVENT</p>`;
      html += `<p><strong>CATEGORY:</strong> ${props.categoryId.toUpperCase()}</p>`;
      if (props.date) html += `<p><strong>DATE:</strong> ${props.date}</p>`;
    } else if (props.event && props.severity) {
      // Weather Alert
      html += `<h3>TARGET: WEATHER ALERT</h3>`;
      html += `<p><strong>EVENT:</strong> ${props.event}</p>`;
      html += `<p class="${props.severity === 'Extreme' || props.severity === 'Severe' ? 'text-red' : 'text-cyan'}"><strong>SEVERITY:</strong> ${props.severity.toUpperCase()}</p>`;
      if (props.headline) html += `<p><strong>DETAILS:</strong> ${props.headline.slice(0, 120)}</p>`;
    } else if (props.operator) {
      // Spaceport
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> LAUNCH FACILITY</p>`;
      html += `<p><strong>COUNTRY:</strong> ${props.country}</p>`;
      html += `<p><strong>OPERATOR:</strong> ${props.operator}</p>`;
      html += `<p class="text-cyan"><strong>STATUS:</strong> OPERATIONAL</p>`;
    } else if (props.gdpWeight) {
      // Economic Center
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> ECONOMIC CENTER</p>`;
      html += `<p><strong>GDP WEIGHT:</strong> ${props.gdpWeight}</p>`;
      html += `<p><strong>INTEL:</strong> ${props.description || 'Financial hub under monitoring'}</p>`;
    } else if (props.description) {
      // Conflict Zone
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> CONFLICT ZONE</p>`;
      html += `<p class="text-red"><strong>STATUS:</strong> ACTIVE</p>`;
      html += `<p><strong>INTEL:</strong> ${props.description}</p>`;
    } else if (props.type && ['weapons', 'enrichment', 'plant'].includes(props.type)) {
      // Nuclear Facility
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> NUCLEAR FACILITY</p>`;
      html += `<p><strong>CLASS:</strong> ${props.type.toUpperCase()}</p>`;
      html += `<p class="text-red"><strong>THREAT:</strong> ${props.type === 'weapons' ? 'HIGH' : (props.type === 'enrichment' ? 'ELEVATED' : 'MODERATE')}</p>`;
    } else if (props.type) {
      // Military Base
      html += `<h3>TARGET: ${props.name.toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> MILITARY INSTALLATION</p>`;
      html += `<p><strong>ALLEGIANCE:</strong> ${props.type.toUpperCase()}</p>`;
      html += `<p class="text-cyan"><strong>STATUS:</strong> MONITORED</p>`;
    } else if (props.status) {
      // CCTV
      this.ui.targetDetails.classList.add('hidden');
      this.ui.cctvPopup.classList.remove('hidden');
      this.ui.cctvId.textContent = props.id;
      this.ui.cctvName.textContent = props.name;
      return;
    } else {
      // Generic fallback for any other entity
      html += `<h3>TARGET: ${(props.name || props.title || props.id || 'UNKNOWN').toString().toUpperCase()}</h3>`;
      html += `<p><strong>TYPE:</strong> UNCLASSIFIED</p>`;
    }

    this.ui.targetContent.innerHTML = html;
  }

  updateAIInsights(pos, isClick = false) {
    if (!this.ui.aiInsightsText) return;

    // Validate position object
    if (!pos || typeof pos.latitude !== 'number' || typeof pos.longitude !== 'number' || isNaN(pos.latitude) || isNaN(pos.longitude)) return;

    const latStr = (pos.latitude >= 0 ? 'N' : 'S');
    const lonStr = (pos.longitude >= 0 ? 'E' : 'W');
    const lat = Math.abs(pos.latitude).toFixed(4);
    const lon = Math.abs(pos.longitude).toFixed(4);

    // Use a 2-degree grid to keep anomalies stable while hovering over a general area
    const gridLat = Math.round(pos.latitude / 2) * 2;
    const gridLon = Math.round(pos.longitude / 2) * 2;
    const hash = Math.floor(Math.abs(gridLat * 1337 + gridLon * 31337));

    const anomalyTypes = [
      "ANOMALY DETECTED IN",
      "NAVAL MOVEMENT:",
      "UNAUTHORIZED FLIGHT PATH:",
      "ENCRYPTED COMM BURST:",
      "THERMAL BLOOM:",
      "TROOP BUILDUP:",
      "SUBTERRANEAN ACTIVITY:",
      "RADAR ANOMALY:",
      "CYBER ATTACK ORIGIN:"
    ];

    // 30% chance for a sector to appear normal
    const isNormal = (hash % 100) < 30;

    let anomalyStr1 = "";
    let anomalyStr2 = "";
    let statusClass = "text-red blink";

    if (isNormal) {
      statusClass = "text-cyan";
      anomalyStr1 = "STATUS: CLEAR";
      anomalyStr2 = "NO ANOMALIES DETECTED in current grid";
    } else {
      const type1 = anomalyTypes[hash % anomalyTypes.length];
      const type2 = anomalyTypes[(hash + 7) % anomalyTypes.length];

      const loc1 = `SECTOR ${Math.abs(gridLat)}°${latStr} ${Math.abs(gridLon)}°${lonStr}`;

      // Secondary anomaly slightly offset
      const offsetLat = Math.abs(gridLat) > 80 ? Math.abs(gridLat) - 2 : Math.abs(gridLat) + 2;
      const loc2 = `SECTOR ${offsetLat}°${latStr} ${Math.abs(gridLon)}°${lonStr}`;

      anomalyStr1 = `${type1} ${loc1}`;
      anomalyStr2 = `${type2} ${loc2}`;
    }

    const threatLevel = isNormal ? "1.0" : ((hash % 8) + 2.1).toFixed(1);

    let html = `
INITIALIZING THREAT ANALYSIS...<br>
ANALYZING SECTOR: <span class="text-cyan">${lat}°${latStr} ${lon}°${lonStr}</span><br>
> SCANNING COMMUNICATIONS... ${isClick ? '<span class="text-red">DEEP SCAN</span>' : 'OK'}<br>
> <span class="${statusClass}">${anomalyStr1}</span><br>
> <span class="${statusClass}">${anomalyStr2}</span><br>
> THREAT LEVEL: ${threatLevel} / 10.0<br>
> AWAITING FURTHER TELEMETRY...
    `;

    this.ui.aiInsightsText.innerHTML = html.trim();
  }

  updateClock() {
    const now = new Date();
    this.ui.timestamp.textContent = 'REC ' + now.toISOString().substring(0, 19).replace('T', ' ') + 'Z';
  }

  // --- Persistence ---

  loadSettings() {
    try {
      const saved = localStorage.getItem('terra5_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };

        // Initialize UI from state
        if (!this.state.sidebarOpen) {
          this.ui.sidebar.classList.add('collapsed');
        }

        ['flights', 'satellites', 'earthquakes', 'weather', 'cctv', 'nuclear', 'military', 'conflicts'].forEach(l => {
          const btn = document.getElementById(`btn-${l}`);
          if (btn) {
            if (this.state.layers[l]) {
              btn.classList.add('active');
              btn.textContent = 'ON';
            } else {
              btn.classList.remove('active');
              btn.textContent = 'OFF';
            }
          }
        });
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
  }

  saveSettings() {
    try {
      const toSave = {
        layers: this.state.layers,
        mode: this.state.mode,
        sidebarOpen: this.state.sidebarOpen,
        camera: this.state.camera
      };
      localStorage.setItem('terra5_settings', JSON.stringify(toSave));
    } catch (e) {
      // Ignore quota errors etc
    }
  }

  // ═══════════════════════════════════════════════
  //  INTEL FEED — RSS Aggregator
  // ═══════════════════════════════════════════════
  async refreshIntelFeed() {
    try {
      this.ui.status.textContent = 'FETCHING SIGINT RSS FEEDS...';
      const items = await APIService.fetchIntelFeed();
      this.intelFeedData = items;
      signalAggregator.ingestNewsItems(items);
      this.renderIntelFeed(items);
      this.updateBreakingNews(items);
      this.ui.status.textContent = `INTEL: ${items.length} ITEMS INGESTED`;
    } catch (e) {
      console.error('[INTEL] Feed refresh failed:', e);
      this.ui.status.textContent = 'WARN: SIGINT UPLINK DEGRADED';
    }
  }

  renderIntelFeed(items) {
    const container = this.ui.intelFeedList;
    if (!container) return;

    container.innerHTML = items.map(item => {
      const threatClass = item.threatLevel === 'CRITICAL' ? 'threat-critical' :
        item.threatLevel === 'HIGH' ? 'threat-high' :
          item.threatLevel === 'ELEVATED' ? 'threat-elevated' : '';
      const timeAgo = this._timeAgo(item.pubDate);
      return `<div class="intel-item" onclick="window.open('${item.link}','_blank')">
        <div class="intel-item-source">
          <span>[${item.source}]</span>
          <span class="intel-item-time">${timeAgo}</span>
        </div>
        <div class="intel-item-title ${threatClass}">${item.title}</div>
      </div>`;
    }).join('');
  }

  updateBreakingNews(items) {
    const critical = items.filter(i => i.threatLevel === 'CRITICAL' || i.threatLevel === 'HIGH');
    if (critical.length > 0 && this.ui.breakingNewsTicker) {
      const headlines = critical.slice(0, 5).map(i => `[${i.source}] ${i.title}`).join('  ///  ');
      this.ui.tickerText.textContent = headlines;
      this.ui.breakingNewsTicker.classList.remove('hidden');
    }
  }

  // ═══════════════════════════════════════════════
  //  WORLD CLOCK — 5 Timezones
  // ═══════════════════════════════════════════════
  updateWorldClock() {
    const now = new Date();
    const fmt = (tz) => now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
    if (this.ui.clockDC) this.ui.clockDC.textContent = fmt('America/New_York');
    if (this.ui.clockLON) this.ui.clockLON.textContent = fmt('Europe/London');
    if (this.ui.clockMSK) this.ui.clockMSK.textContent = fmt('Europe/Moscow');
    if (this.ui.clockBEJ) this.ui.clockBEJ.textContent = fmt('Asia/Shanghai');
    if (this.ui.clockTKY) this.ui.clockTKY.textContent = fmt('Asia/Tokyo');
  }

  // ═══════════════════════════════════════════════
  //  HELPER — Relative time
  // ═══════════════════════════════════════════════
  _timeAgo(date) {
    if (!date) return '';
    const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (secs < 60) return 'JUST NOW';
    if (secs < 3600) return `${Math.floor(secs / 60)}M AGO`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}H AGO`;
    return `${Math.floor(secs / 86400)}D AGO`;
  }
}

// Start app
const app = new AppController();
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
