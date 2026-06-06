// src/services/mock.js

export class MockService {
    static generateDetections(centerLat, centerLon, radiusKm = 10, count = 5) {
        const categories = ['Vehicle', 'Aircraft', 'Vessel', 'Building', 'Person'];
        const detections = [];

        for (let i = 0; i < count; i++) {
            // Random offset within roughly radiusKm
            // 1 degree lat is ~111km
            const latOffset = (Math.random() - 0.5) * (radiusKm / 111) * 2;
            const lonOffset = (Math.random() - 0.5) * (radiusKm / 111) * 2;

            detections.push({
                id: `det-${Math.random().toString(36).substr(2, 6)}`,
                category: categories[Math.floor(Math.random() * categories.length)],
                confidence: (0.7 + Math.random() * 0.29).toFixed(2), // 0.70 to 0.99
                latitude: centerLat + latOffset,
                longitude: centerLon + lonOffset,
                // Screen space box mock
                x: Math.floor(Math.random() * (window.innerWidth - 200) + 100),
                y: Math.floor(Math.random() * (window.innerHeight - 200) + 100),
                width: 40 + Math.random() * 60,
                height: 40 + Math.random() * 60
            });
        }

        return detections;
    }

    // Renders the simulated detection boxes on the DOM over the Cesium canvas
    static renderDetectionsUI(detections) {
        let container = document.getElementById('panoptic-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'panoptic-container';
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '5';
            document.getElementById('ui-layer').appendChild(container);
        }

        container.innerHTML = ''; // Clear old

        // Add Scanline
        const scanline = document.createElement('div');
        scanline.className = 'panoptic-scanline';
        container.appendChild(scanline);

        detections.forEach(det => {
            const box = document.createElement('div');
            box.className = 'ai-target-box';
            box.style.left = `${det.x}px`;
            box.style.top = `${det.y}px`;
            box.style.width = `${det.width}px`;
            box.style.height = `${det.height}px`;

            const label = document.createElement('div');
            label.className = 'ai-target-label';
            label.textContent = `${det.category} [${(det.confidence * 100).toFixed(1)}%]`;

            box.appendChild(label);
            container.appendChild(box);
        });
    }

    static clearDetectionsUI() {
        const container = document.getElementById('panoptic-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Mock CCTV Cameras (distributed around major cities)
    static generateCCTV() {
        const cities = [
            { lat: 38.8951, lon: -77.0364 }, // DC
            { lat: 40.7128, lon: -74.0060 }, // NYC
            { lat: 51.5074, lon: -0.1278 },  // London
            { lat: 35.6762, lon: 139.6503 }, // Tokyo
            { lat: 30.2672, lon: -97.7431 }  // Austin
        ];

        const cameras = [];
        const types = ['Traffic', 'Security', 'Public Space', 'Infrastructure', 'Airport'];
        const statuses = ['Online', 'Recording', 'Maintenance'];

        cities.forEach((city, cityIdx) => {
            // Generate 5 cameras per city
            for (let i = 0; i < 5; i++) {
                const latOffset = (Math.random() - 0.5) * 0.1;
                const lonOffset = (Math.random() - 0.5) * 0.1;

                cameras.push({
                    id: `CAM-${cityIdx}-${i}`,
                    name: `CCTV-${cityIdx}-${i} ${types[i]}`,
                    type: types[i],
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    latitude: city.lat + latOffset,
                    longitude: city.lon + lonOffset
                });
            }
        });

        return cameras;
    }

    // Mock Weather Radar stations
    static generateWeatherRadar() {
        const stations = [];
        const conditions = ['None', 'Light', 'Moderate', 'Heavy', 'Extreme'];

        // Random 26 stations across the US
        for (let i = 0; i < 26; i++) {
            const lat = 25 + Math.random() * 25; // 25 to 50
            const lon = -125 + Math.random() * 55; // -125 to -70
            const precipIdx = Math.floor(Math.random() * conditions.length);

            stations.push({
                id: `WXR-${i}`,
                name: `NEXRAD Station ${i}`,
                condition: conditions[precipIdx],
                precipitationLevel: precipIdx,
                latitude: lat,
                longitude: lon
            });
        }

        return stations;
    }
}
