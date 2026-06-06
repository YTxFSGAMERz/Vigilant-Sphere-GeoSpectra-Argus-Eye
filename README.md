# 🌍 VIGILANT SPHERE: GEOSPECTRA ARGUS EYE
```
================================================================================
  [ SECURE UPLINK ESTABLISHED ] // [ AUTH: OPERATOR_LEVEL_5 ] // [ KH11-OPS-4117 ]
================================================================================
   _  __  _         _   _                   _      ____    _____    _  _   
  | |/ / | |__     / | / |  _   _   _ __   | |    |  _ \  | ____|  | || |  
  | ' /  | '_ \    | | | | | | | | | '_ \  | |    | |_) | |  _|    | || |_ 
  | . \  | | | |   | | | | | |_| | | |_) | | |___ |  __/  | |___   |__   _|
  |_|\_\ |_| |_|   |_| |_|  \__,_| | .__/  |_____||_|     |_____|     |_|  
                                   |_|                                     
================================================================================
  // WARNING: TOP SECRET // SI-TK // NOFORN // CODE name: ARGUS EYE
================================================================================
```

[![Live Demo](https://img.shields.io/badge/🛰️_LIVE_FEED-ACTIVE-00d4aa?style=for-the-badge&labelColor=0a0a0a)](https://vigilant-sphere-geospectra-argus-eye.vercel.app/)
[![License: MIT](https://img.shields.io/badge/Security_Protocol-MIT-ffaa00?style=for-the-badge&labelColor=0a0a0a)](./LICENSE)
[![Built with Vite](https://img.shields.io/badge/System_Engine-Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=0a0a0a)](https://vite.dev)
[![Powered by Cesium](https://img.shields.io/badge/Imaging_Core-Cesium.js-6CADDF?style=for-the-badge&logo=cesium&logoColor=white&labelColor=0a0a0a)](https://cesium.com)
[![Deployed on Vercel](https://img.shields.io/badge/Operational_Uplink-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0a0a0a)](https://vercel.com)

> **[OPERATIONAL DIRECTIVE]**: This terminal executes the *Vigilant Sphere GeoSpectra Argus Eye* geospatial tracking interface. It maps global military telemetry, orbital vectors, natural disasters, seismic data, and live news streams onto a unified 3D planetary tactical map.

---

## ⚡ TECH STACK SPECIFICATIONS

```
[SYSTEM CONFIGURATION]
 ├── IMAGING_CORE      : Cesium.js (High-fidelity 3D Globe Rendering Engine)
 ├── PIPELINE_BUILDER  : Vite (Next-gen compilation and hot reloading)
 ├── CONTROL_LOGIC     : Vanilla JS ES6+ (Modular zero-dependency logic)
 ├── HUD_INTERFACE     : Raw CSS Custom Tokens (1100+ lines of custom UI styling)
 └── SERVERLESS_HOST   : Vercel Production Environment
```

---

## 📡 COGNITIVE INGESTION PIPELINE (LIVE APIs)

The terminal queries **6 global network nodes** to build the real-time threat map:

| Sub-system | Data Stream | Sensor Type |
| :--- | :--- | :--- |
| 🛫 **AIR_TRAFFIC** | OpenSky Network | ADS-B military & commercial transponder updates |
| 🛰️ **ORBITAL_ASSETS** | CelesTrak | NORAD TLE parameters tracking active LEO/GEO satellites |
| 🌋 **SEISMIC_MONITOR** | USGS GeoJSON | Instantaneous magnitude/depth earthquake updates |
| 🌪️ **NASA_EONET** | NASA EONET | Active hurricanes, severe storms, and lake/sea ice events |
| 🔥 **THERMAL_BLOOMS** | NASA FIRMS | VIIRS real-time wildfire hotspot coordinates |
| ⛈️ **MET_SERVICES** | National Weather Service | Active meteorological hazards and county alerts |

> [!NOTE]
> **FEEDS FAILSAFE PROTOCOL**: If external nodes are rate-limited or offline, the interface activates simulated data matrices, preventing the Tactical HUD from going dark.

---

## 👁️ SENSOR MODES (GLSL POST-PROCESSING)

Toggle between custom real-time **GLSL fragment shaders** applied directly to the 3D viewport canvas:

```
[SELECT SENSOR OVERLAY]:
 ├── CRT   : Phosphor screen emulator with scanlines and chromatic aberration.
 ├── NVG   : Green-phosphor light-intensified Night Vision Goggles with ISO grain.
 ├── FLIR  : Forward-Looking Infrared mapping luma to a 4-band thermal spectrum.
 ├── NOIR  : Vignetted, high-contrast monochrome surveillance overlay.
 ├── ANIME : Edge-detection rendering with color-quantization outlines.
 ├── SNOW  : Severe winter storm conditions emulator with noise grain.
 └── AI    : PANOPTIC mode (Object classification overlay active).
```

---

## 🧠 KEY TACTICAL MODULES

### 🔲 PANOPTIC A.I. TARGETING
Activating **AI mode** starts a rolling vertical scanline overlay. The targeting core generates dynamic bounding boxes around planetary coordinates, classifying anomalies into: `Vehicle`, `Aircraft`, `Vessel`, `Building`, or `Person` with a computed confidence rating.

### 📶 GEO-AI UPLINK (THREAT MATRIX)
A context-aware analyzer responding to cursor hover over coordinates. It runs local analysis based on a 2° latitude/longitude grid, calculating localized threat indexes (0-10) and printing status reports: *Naval Movement*, *Encrypted Comm Burst*, *Thermal Bloom*, or *Troop Buildup*.

### 🍕 PIZZINT (PENTAGON PIZZA INDEX)
A status monitoring system tracking late-night pizza orders at three locations (Arlington Pentagon HQ, Langley CIA, and Fort Meade NSA) as a proxy for geopolitical events.

---

## 📂 DIRECTORY STRUCTURE

*   [`index.html`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/index.html) — Core HTML5 viewport wrapper and HUD overlays.
*   [`src/main.js`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/main.js) — The central [`AppController`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/main.js#L8) class managing polling, state, and UI binding.
*   [`src/globe.js`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/globe.js) — The [`Terra5Globe`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/globe.js#L3) class wrapping Cesium, layer logic, and GLSL shaders.
*   [`src/style.css`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/style.css) — Custom HUD stylings, blinking animations, and layouts.
*   [`src/services/api.js`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/services/api.js) — Interface for raw external API networks.
*   [`src/services/signalAggregator.js`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/services/signalAggregator.js) — Ingestion queue correlating cross-source threat parameters.

---

## 🚀 BOOT SEQUENCE (LOCAL SETUP)

Ensure **Node.js** (v18+) is installed. Run the following terminal scripts:

```bash
# Clone the repository
git clone https://github.com/YTxFSGAMERz/Vigilant-Sphere-GeoSpectra-Argus-Eye.git

# Initialize local workspace
cd Vigilant-Sphere-GeoSpectra-Argus-Eye
npm install

# Start Local Dev Interface
npm run dev
```

Open the terminal dashboard at **[http://localhost:5173/](http://localhost:5173/)**.

---

```
================================================================================
  [ END OF TRANSMISSION ] // [ SECURE CONSOLE CLOSED ]
================================================================================
```
