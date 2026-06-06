const fs = require('fs');
const turf = require('@turf/turf');

const geojsonPath = './public/countries.geojson';
const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Find all features named Palestine
const palestineFeatures = data.features.filter(f => f.properties.NAME === 'Palestine' || f.properties.ADMIN === 'Palestine');

if (palestineFeatures.length > 1) {
    console.log(`Found ${palestineFeatures.length} Palestine features. Unioning them...`);
    
    // We union them all together
    let unifiedFeature = palestineFeatures[0];
    for (let i = 1; i < palestineFeatures.length; i++) {
        unifiedFeature = turf.union(turf.featureCollection([unifiedFeature, palestineFeatures[i]]));
    }
    
    // Ensure properties are kept
    unifiedFeature.properties = palestineFeatures[0].properties;
    
    // Remove the old features from the data
    data.features = data.features.filter(f => f.properties.NAME !== 'Palestine' && f.properties.ADMIN !== 'Palestine');
    
    // Push the new unified feature
    data.features.push(unifiedFeature);
    
    fs.writeFileSync(geojsonPath, JSON.stringify(data));
    console.log('Successfully unioned the Palestine boundaries and saved countries.geojson.');
} else {
    console.log('Found fewer than 2 Palestine features. Nothing to merge.');
}
