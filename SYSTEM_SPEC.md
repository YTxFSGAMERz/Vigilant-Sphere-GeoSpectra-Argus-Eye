# 📊 SYSTEM_SPEC: VIGILANT SPHERE INTERNAL SPECIFICATIONS
```
================================================================================
  [ SECURE TECHNICAL DOCUMENTATION ] // [ LEVEL 5 ACCESS REQUIRED ]
================================================================================
```

This document details the software engineering specifications, mathematical algorithms, and post-processing shader pipelines powering the *Vigilant Sphere GeoSpectra Argus Eye* platform.

---

## 1. CORE RENDER SYSTEM: CESIUM WRAPPER

The platform leverages [Cesium.js](https://cesium.com) for high-fidelity 3D rendering. The globe initialization is wrapped inside the [`Terra5Globe`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/globe.js#L3) class, disabling default consumer overlays (geocoder, animation timelines, credits) to preserve a clean tactical interface:

```javascript
this.viewer = new Cesium.Viewer(this.containerId, {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false,
    selectionIndicator: false,
    infoBox: false,
    shouldAnimate: true,
    skyBox: false,
    baseLayer: false
});
```

### 🛰️ Imagery Layer
The globe draws mapping data from the **ArcGIS World Imagery Map Server**:
`https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer`

---

## 2. GLSL SHADER PIPELINE (POST-PROCESSING)

All visual sensor overlays are constructed using custom **GLSL (OpenGL Shading Language)** fragment shaders. These are loaded into Cesium's `postProcessStages` pool to manipulate the frame buffer on every render pass.

### 🟢 Night Vision Goggle (NVG) Shader
Calculates the relative luminance (Luma) of the frame buffer using standard NTSC weighting coefficients, shifts the hue to green-phosphor, overlays procedural static noise, and applies a vignette:

$$\text{Luma} = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

```glsl
uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;
void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 nvg = vec3(0.0, luma * 1.3, luma * 0.1);
    float noise = fract(sin(dot(v_textureCoordinates * 1000.0, vec2(12.9898, 78.233))) * 43758.5453);
    nvg += noise * 0.05;
    nvg = pow(nvg, vec3(0.85));
    float vignette = 1.0 - length((v_textureCoordinates - 0.5) * 0.8);
    nvg *= vignette;
    out_FragColor = vec4(nvg, 1.0);
}
```

### 🔥 FLIR (Thermal Infrared) Shader
Processes the luma values and performs step-wise color mixing across a four-band palette (deep blue $\rightarrow$ violet $\rightarrow$ bright orange $\rightarrow$ white) to visualize temperature differentials:

```glsl
if (luma < 0.25) { 
    thermal = mix(vec3(0.0, 0.0, 0.1), vec3(0.3, 0.0, 0.4), luma * 4.0); 
} else if (luma < 0.5) { 
    thermal = mix(vec3(0.3, 0.0, 0.4), vec3(0.8, 0.2, 0.0), (luma - 0.25) * 4.0); 
} else if (luma < 0.75) { 
    thermal = mix(vec3(0.8, 0.2, 0.0), vec3(1.0, 0.9, 0.0), (luma - 0.5) * 4.0); 
} else { 
    thermal = mix(vec3(1.0, 0.9, 0.0), vec3(1.0, 1.0, 1.0), (luma - 0.75) * 4.0); 
}
```

---

## 3. SIGNAL ANALYSIS CORRELATION ENGINE

The [`SignalAggregator`](file:///c:/Users/Admin/Documents/GitHub/Vigilant-Sphere-GeoSpectra-Argus-Eye/src/services/signalAggregator.js#L32) monitors the ingestion of external data points and checks them against pre-defined geographical zones to calculate regional threat indexes:

```javascript
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
    }
};
```

### 📉 Convergence Logic
A convergence zone is flagged if a country in the zone records $\ge 3$ active signals (e.g. military flights + wildfire + breaking news) in a rolling 24-hour window. This triggers threat notices on the HUD and updates the context sent to the GEO-AI panel.

---

```
================================================================================
  [ END OF SPECIFICATION ]
================================================================================
```
