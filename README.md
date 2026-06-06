# 🌍 Vigilant Sphere GeoSpectra Argus Eye

<div align="center">

**~Made by Farhan FS**

[![Live Demo](https://img.shields.io/badge/🔴_LIVE-DEMO-00d4aa?style=for-the-badge&labelColor=0a0a0a)](https://vigilant-sphere-geospectra-argus-eye.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffaa00?style=for-the-badge&labelColor=0a0a0a)](./LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built_with-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=0a0a0a)](https://vite.dev)
[![Powered by Cesium](https://img.shields.io/badge/Powered_by-Cesium.js-6CADDF?style=for-the-badge&logo=cesium&logoColor=white&labelColor=0a0a0a)](https://cesium.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0a0a0a)](https://vercel.com)

<br/>

> **An elite, bleeding-edge 3D global visualization and geospatial intelligence tracking system.**
> This application transforms a standard web browser into an advanced **military-grade geospatial command center** with a cinematic Heads-Up Display.

</div>

---

## ⚡ Tech Stack

| Technology | Purpose |
|:---:|:---|
| **Cesium.js** | High-fidelity 3D globe rendering engine with real-time satellite imagery |
| **Vite** | Lightning-fast build tool and dev server |
| **Vanilla JS** | Zero-dependency, modular ES6+ application architecture |
| **Custom CSS** | 1100+ lines of handcrafted HUD-themed styling |
| **Vercel** | Production deployment with automatic CI/CD |

---

## 🛠️ Deep Dive: Core Capabilities

### 1. The Globe Engine (Cesium.js)
At the heart of the system lies a high-fidelity 3D rendering engine powered by **Cesium.js** with **ArcGIS World Imagery**. This enables unparalleled performance in rendering the Earth in full 3D, allowing users to effortlessly pan, zoom, and traverse international borders in real-time. The globe features:
- Dark-themed atmosphere with custom fog density
- Real-time camera position tracking (Latitude, Longitude, Altitude)
- Live **MGRS** (Military Grid Reference System) coordinate computation
- **GSD** (Ground Sample Distance) and **NIIRS** rating calculations based on camera altitude
- Click-to-inspect entity system with detailed intelligence popups

---

### 2. 📡 Live Intelligence Layers (Real-World APIs)
The system actively pulls and visualizes real-world data from **6 live APIs** to populate the globe with actionable intelligence:

| Layer | API Source | Data |
|:---|:---|:---|
| 🛫 **Live Flights** | OpenSky Network | ADS-B flight telemetry — callsigns, velocity, altitude, headings |
| 🛰️ **Satellites** | CelesTrak | TLE sets for active orbital assets — LEO and geostationary paths |
| 🌋 **Earthquakes** | USGS GeoJSON | Live seismic events — magnitude, depth, location |
| 🌪️ **Natural Events** | NASA EONET | Volcanoes, severe storms, sea/lake ice events |
| 🔥 **Wildfires** | NASA FIRMS | Active fire hotspots globally via CSV ingestion |
| ⛈️ **Weather Alerts** | NWS (National Weather Service) | Active severe weather alerts with severity classification |

> **Failsafe**: Features automated fallback systems that simulate generated data if external APIs are rate-limited, ensuring the HUD never goes dark.

---

### 3. 🗺️ Static Geopolitical & Strategic Datasets
Hardcoded high-value intelligence layers sourced from curated geopolitical databases:

| Layer | Contents |
|:---|:---|
| ☢️ **Nuclear Sites** | Weapons labs, enrichment facilities, and power plants worldwide |
| 🏛️ **Military Bases** | US-NATO, Chinese PLA, and Russian installations globally |
| 🔴 **Conflict Zones** | Active war theaters — Ukraine, Iran, Yemen Red Sea, Sudan, Myanmar |
| ⚓ **Strategic Waterways** | Suez Canal, Strait of Hormuz, Malacca Strait, Panama Canal, and more |
| 🎯 **Intel Hotspots** | Sahel, South China Sea, Korean Peninsula, Arctic, Eastern Congo, etc. |
| 🔌 **Undersea Cables** | Major transoceanic fiber-optic cables with capacity ratings |
| 🚀 **Spaceports** | Cape Canaveral, Baikonur, Jiuquan, Kourou, and more |
| 💰 **Economic Centers** | NYSE, London Stock Exchange, Shanghai, Frankfurt, Mumbai financial hubs |

---

### 4. 🔬 Simulated Tactical Feeds

- **☁️ Weather Radar Synthesis** — Projects massive simulated storm systems, cloud cover, and precipitation patterns directly over the globe via 26 NEXRAD-style radar stations.
- **📷 Global CCTV Network** — Interactive grid of 25 simulated surveillance cameras across 5 major cities (DC, NYC, London, Tokyo, Austin). Clicking a node opens a live animated static-feed modal with retro UI elements and "LIVE FEED" indicators.

---

## 👁️ Advanced Electro-Optical (EO) Modes

The application features a revolutionary post-processing stack with **real-time GLSL shaders** applied to the Cesium 3D canvas:

| Mode | Effect |
|:---|:---|
| `NORMAL` | Crisp, unadulterated high-resolution satellite imagery |
| `CRT` | Aging cathode-ray tube — scanlines, phosphor bleed, chromatic aberration, screen curvature |
| `NVG` | Night Vision Goggles — green-phosphor intensification, ISO grain, contrast crushing |
| `FLIR` | Forward-Looking Infrared — 4-band thermal palette (cold blue → hot white) |
| `NOIR` | High-contrast black-and-white — vignette, smoothstep tone mapping |
| `ANIME` | Cel-shaded — color quantization with Sobel edge-detection outlining |
| `SNOW` | Winter blizzard — desaturation, blue shift, noise grain overlay |
| `AI` | PANOPTIC Mode — activates the full AI targeting overlay system |

---

## 🎯 The PANOPTIC A.I. Targeting System

Activating **AI / PANOPTIC Mode** triggers a sweeping, dynamic HUD overlay:
- 🔲 Generates pulsating **holographic targeting brackets** with object classification (`Vehicle`, `Aircraft`, `Vessel`, `Building`, `Person`) and confidence percentages
- 📊 Implements a sweeping **scanline animation** that constantly analyzes the vertical Y-axis
- 🧠 Simulated deep-learning apparatus acquiring lock-on data with randomized bounding boxes
- Auto-updates every 2 seconds with fresh detection targets

---

## 🧠 GEO-AI UPLINK — Context-Aware Intelligence Panel

A real-time **AI insights panel** that dynamically responds to cursor position:
- Generates **sector-based threat analysis** using a 2° lat/lon grid hashing system
- Detects anomaly types: Naval Movement, Encrypted Comm Burst, Thermal Bloom, Troop Buildup, Subterranean Activity, Radar Anomaly, Cyber Attack Origin
- **Deep Scan** mode triggered on click for enhanced analysis
- Threat Level rating computed procedurally (0–10 scale)
- 30% chance per grid sector to report "STATUS: CLEAR"

---

## 📺 Live News & Intelligence Feeds

### Live Video Streams
Embedded live YouTube broadcasts from major news networks:
- **Al Jazeera English** (AJE)
- **Sky News** (SKY)
- **DW News** (DW)
- **NASA TV** (NASA)

### 📡 SIGINT RSS Feed Aggregator
A multi-source RSS intelligence feed parsed via CORS proxy, aggregating headlines from:
- Reuters, Al Jazeera, BBC, Associated Press
- Threat-level classification: `CRITICAL` / `HIGH` / `ELEVATED` / `NORMAL`
- Relative timestamps (JUST NOW, 5M AGO, 2H AGO)
- Click-to-open source articles in new tab

### ⚠️ Breaking News Ticker
Auto-displays a scrolling ticker bar for `CRITICAL` and `HIGH` threat-level headlines across the top of the viewport.

---

## 🔮 Signal Aggregator Engine

A dedicated **`SignalAggregator`** service that cross-correlates signals from all data sources:
- Ingests earthquakes, weather alerts, flights, natural events, wildfires, internet outages, and breaking news
- **Regional convergence detection** across defined theaters: East Asia, Middle East, Eastern Europe, Sahel, South Asia
- Generates AI context strings for the GEO-AI UPLINK panel
- Maintains a rolling 24-hour signal window with automatic pruning
- Tracks signal counts by type and filters high-severity events

---

## 🍕 Easter Eggs & Secret Features

### Pentagon Pizza Index (PIZZINT)
A tongue-in-cheek intelligence indicator monitoring pizza delivery volumes to US defense facilities:
- **HQ (Arlington)**: High Volume 🔴
- **CIA (Langley)**: Normal 🟢
- **NSA (Ft Meade)**: Normal 🟢
- Threat level meter with visual bar indicator

---

## ⏰ World Clock Widget

Five-timezone operational clock displaying real-time local times:
| Label | Timezone |
|:---:|:---|
| DC | America/New_York (Eastern) |
| LON | Europe/London (GMT/BST) |
| MSK | Europe/Moscow |
| BEJ | Asia/Shanghai |
| TKY | Asia/Tokyo |

---

## 🖱️ Ergonomics & User Experience Control

- **Tactical Cursor Navigation** — Standard browser cursor globally replaced with custom SVG crosshair. Dynamically morphs to `warning-orange` when hovering over interactive elements.
- **Collapsible Sidebar** — Opaque left-hand sidebar houses all 16 layer toggles, 8 visual mode switches, and city quick-jumps. Toggled via `Ctrl+[` keyboard shortcut.
- **City Quick-Jumps** — Pre-programmed orbital camera fly-to locations: Washington DC, New York, London, Tokyo, Austin, San Francisco, Sydney, Paris.
- **Entity Click Inspector** — Click any entity on the globe to see detailed intelligence popups with typed metadata (aircraft telemetry, earthquake magnitude, satellite NORAD ID, cable capacity, etc.)
- **Persistent State** — All layer toggles, visual modes, sidebar state, and camera position automatically saved to `localStorage` and restored on reload.
- **Security Hardening** — Intercepts DevTools shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U) and disables right-click context menus.
- **Keyboard Shortcuts**:
  - `Ctrl+[` — Toggle sidebar
  - `Ctrl+P` — Toggle PANOPTIC mode
  - `Escape` — Close all floating panels
- **Open Graph & Twitter Card** — Full social media preview meta tags with cover image for rich link sharing.

---

## 🏗️ Project Architecture

```
Vigilant-Sphere-GeoSpectra-Argus-Eye/
├── index.html              # Main application shell (380 lines)
├── package.json            # Vite build configuration
├── public/
│   └── cover-image.png     # Open Graph preview image
└── src/
    ├── main.js             # App controller — state, events, data orchestration (798 lines)
    ├── globe.js            # Cesium.js wrapper — 16 data layers, 7 GLSL shaders (825 lines)
    ├── style.css           # Full HUD theme — panels, animations, custom cursors (1105 lines)
    └── services/
        ├── api.js          # Live API integrations — 6 external sources + RSS parser (358 lines)
        ├── mapData.js      # Static geopolitical datasets — 8 categories (188 lines)
        ├── mock.js         # Simulated data generators — CCTV, weather, PANOPTIC (136 lines)
        └── signalAggregator.js  # Cross-source signal correlation engine (243 lines)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)

### Installation

```bash
# Clone the repository
git clone https://github.com/YTxFSGAMERz/Vigilant-Sphere-GeoSpectra-Argus-Eye.git

# Navigate into the project
cd Vigilant-Sphere-GeoSpectra-Argus-Eye

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Production Build

```bash
npm run build    # Output → dist/
npm run preview  # Preview production build locally
```

---

## 🌐 Live Deployment

The application is live at:
**[https://vigilant-sphere-geospectra-argus-eye.vercel.app/](https://vigilant-sphere-geospectra-argus-eye.vercel.app/)**

Deployed automatically via Vercel with `npm run build` → `dist/` directory.

---

## 📊 Stats at a Glance

| Metric | Value |
|:---|:---|
| Total Source Lines | **3,500+** |
| Data Layers | **16** (8 core + 8 intel) |
| Visual Modes | **8** (7 GLSL shaders + normal) |
| Live API Sources | **6** |
| Static Datasets | **8** geopolitical categories |
| RSS News Sources | **4** (Reuters, Al Jazeera, BBC, AP) |
| Live Video Channels | **4** (AJE, Sky, DW, NASA) |
| City Quick-Jumps | **8** preset locations |
| World Clock Zones | **5** |
| Keyboard Shortcuts | **6+** |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

**Copyright © 2026 Farhan**

---

<div align="center">

*Vigilant Sphere GeoSpectra Argus Eye // End of Transmission.*

**`[ SYSTEM STATUS: ALL NOMINAL ]`**

</div>
