const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

function truncateCoordinates(coords, precision = 5) {
    if (Array.isArray(coords)) {
        if (typeof coords[0] === 'number') {
            return coords.map(c => Number(c.toFixed(precision)));
        } else {
            return coords.map(c => truncateCoordinates(c, precision));
        }
    }
    return coords;
}

function processGeoJSON(filePath) {
    console.log(`Processing ${path.basename(filePath)}...`);
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const geojson = JSON.parse(rawData);
        
        let modified = false;

        if (geojson.features) {
            geojson.features.forEach(feature => {
                if (feature.geometry && feature.geometry.coordinates) {
                    feature.geometry.coordinates = truncateCoordinates(feature.geometry.coordinates);
                    modified = true;
                }
                
                // Optional: remove properties if needed, but since we are just doing lossless compression, we only truncate coords.
                // We'll leave properties intact for now to ensure we don't break name/scalerank logic.
            });
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(geojson));
            console.log(`Successfully compressed ${path.basename(filePath)}.`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
    }
}

const files = fs.readdirSync(PUBLIC_DIR);
files.forEach(file => {
    if (file.endsWith('.geojson')) {
        processGeoJSON(path.join(PUBLIC_DIR, file));
    }
});

console.log('Finished processing all GeoJSON files.');
