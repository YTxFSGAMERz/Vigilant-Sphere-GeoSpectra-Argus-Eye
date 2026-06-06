// src/globe.js

export class Terra5Globe {
    constructor(containerId) {
        this.viewer = null;
        this.dataSources = {};
        this.currentMode = 'normal';
        this.containerId = containerId;
        this.onCameraChange = null;
        this.onEntityClick = null;
        this.pinBuilder = new Cesium.PinBuilder();
        this._iconCache = {};
    }

    // Render an emoji onto a canvas and return as data URL for billboard use
    _makeIcon(emoji, size = 48) {
        const key = `${emoji}-${size}`;
        if (this._iconCache[key]) return this._iconCache[key];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.font = `${Math.floor(size * 0.75)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, size / 2, size / 2 + 2);
        const dataUrl = canvas.toDataURL();
        this._iconCache[key] = dataUrl;
        return dataUrl;
    }

    init() {
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
            baseLayer: false,
            skyAtmosphere: new Cesium.SkyAtmosphere()
        });

        const initProvider = async () => {
            try {
                const imagery = await Cesium.ArcGisMapServerImageryProvider.fromUrl('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer');
                // const labels = await Cesium.ArcGisMapServerImageryProvider.fromUrl('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer');
                if (this.viewer && this.viewer.imageryLayers) {
                    this.viewer.imageryLayers.addImageryProvider(imagery);
                    // this.viewer.imageryLayers.addImageryProvider(labels); // Hide default country labels (including Israel)
                }

                // Load Global Countries Borders (Custom Vector)
                const countriesPromise = Cesium.GeoJsonDataSource.load('/countries.geojson', {
                    stroke: Cesium.Color.fromCssColorString('#00ff00').withAlpha(0.4),
                    fill: Cesium.Color.TRANSPARENT,
                    strokeWidth: 2,
                    clampToGround: true
                });
                
                const countriesDS = await countriesPromise;
                
                const labeledCountries = new Set();

                // Add center labels for each country to completely replace ArcGIS base labels
                countriesDS.entities.values.forEach(entity => {
                    if (entity.polygon) {
                        entity.polygon.outline = true;
                        entity.polygon.outlineColor = Cesium.Color.fromCssColorString('#00ff00').withAlpha(0.8);
                        entity.polygon.material = Cesium.Color.fromCssColorString('#002200').withAlpha(0.01);
                        
                        // Explicitly add polylines for reliable borders
                        if (entity.polygon.hierarchy) {
                            const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
                            if (hierarchy && hierarchy.positions) {
                                entity.polyline = new Cesium.PolylineGraphics({
                                    positions: hierarchy.positions,
                                    width: 2,
                                    material: Cesium.Color.fromCssColorString('#00ff00').withAlpha(0.5),
                                    clampToGround: true
                                });
                            }
                        }

                        let center;
                        if (entity.properties && entity.properties.LABEL_X && entity.properties.LABEL_Y) {
                           center = Cesium.Cartesian3.fromDegrees(entity.properties.LABEL_X.getValue(), entity.properties.LABEL_Y.getValue());
                        } else if (entity.polygon.hierarchy) {
                           // Fallback for centroid
                           center = Cesium.BoundingSphere.fromPoints(entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions).center;
                        }

                        let countryName = '';
                        if (entity.properties) {
                            countryName = entity.properties.NAME ? entity.properties.NAME.getValue() : '';
                        }
                        
                        if (countryName && countryName !== '' && !labeledCountries.has(countryName) && center) {
                            labeledCountries.add(countryName);
                            countriesDS.entities.add({
                                position: center,
                                label: {
                                    text: countryName,
                                    font: 'bold 18px "Share Tech Mono", monospace',
                                    fillColor: Cesium.Color.fromCssColorString('#00FFFF').withAlpha(0.9),
                                    outlineColor: Cesium.Color.BLACK,
                                    outlineWidth: 3,
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
                                }
                            });
                        }
                    }
                });

                this.viewer.dataSources.add(countriesDS);
                
                // Load States and Provinces
                try {
                    const statesPromise = Cesium.GeoJsonDataSource.load('/states.geojson', {
                        stroke: Cesium.Color.fromCssColorString('#00ff00').withAlpha(0.2),
                        fill: Cesium.Color.TRANSPARENT,
                        strokeWidth: 1,
                        clampToGround: true
                    });
                    const statesDS = await statesPromise;
                    const labeledStates = new Set();
                    statesDS.entities.values.forEach(entity => {
                        if (entity.polygon) {
                            entity.polygon.outline = true;
                            entity.polygon.outlineColor = Cesium.Color.fromCssColorString('#00ff00').withAlpha(0.2);
                            entity.polygon.material = Cesium.Color.fromCssColorString('#002200').withAlpha(0.01);
                            
                            if (entity.polygon.hierarchy) {
                                const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
                                if (hierarchy && hierarchy.positions) {
                                    entity.polyline = new Cesium.PolylineGraphics({
                                        positions: hierarchy.positions,
                                        width: 1,
                                        material: Cesium.Color.fromCssColorString('#00ff00').withAlpha(0.2),
                                        clampToGround: true
                                    });
                                }
                            }

                            let center;
                            if (entity.properties && entity.properties.LABEL_X && entity.properties.LABEL_Y) {
                               center = Cesium.Cartesian3.fromDegrees(entity.properties.LABEL_X.getValue(), entity.properties.LABEL_Y.getValue());
                            }

                            let stateName = '';
                            if (entity.properties) {
                                stateName = entity.properties.name ? entity.properties.name.getValue() : (entity.properties.NAME ? entity.properties.NAME.getValue() : '');
                            }
                            
                            if (stateName && stateName !== '' && !labeledStates.has(stateName) && center) {
                                labeledStates.add(stateName);
                                statesDS.entities.add({
                                    position: center,
                                    label: {
                                        text: stateName,
                                        font: '13px "Share Tech Mono", monospace',
                                        fillColor: Cesium.Color.fromCssColorString('#B0BEC5').withAlpha(0.95),
                                        outlineColor: Cesium.Color.BLACK,
                                        outlineWidth: 2,
                                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
                                    }
                                });
                            }
                        }
                    });
                    this.viewer.dataSources.add(statesDS);
                } catch(e) {
                    console.log('States not loaded yet');
                }

                // Load Global Populated Places (Cities)
                try {
                    const citiesGlobalPromise = Cesium.GeoJsonDataSource.load('/cities.geojson');
                    const citiesGlobalDS = await citiesGlobalPromise;

                    citiesGlobalDS.entities.values.forEach(entity => {
                        // Hide default point completely
                        if (entity.billboard) { entity.billboard.show = false; }
                        if (entity.point) { entity.point.show = false; }

                        if (entity.position) {
                            let scalerank = entity.properties && entity.properties.SCALERANK ? entity.properties.SCALERANK.getValue() : 10;
                            let cityName = entity.properties && entity.properties.NAME ? entity.properties.NAME.getValue() : '';
                            
                            // Dynamic city rendering based on global importance
                            if (cityName && scalerank <= 8) {
                                let fontSize = '10px';
                                let maxDist = 1500000;
                                
                                if (scalerank <= 2) {
                                    fontSize = '13px';
                                    maxDist = 15000000;
                                } else if (scalerank <= 4) {
                                    fontSize = '12px';
                                    maxDist = 6000000;
                                } else if (scalerank <= 6) {
                                    fontSize = '11px';
                                    maxDist = 3000000;
                                }

                                entity.label = new Cesium.LabelGraphics({
                                    text: cityName,
                                    font: `${fontSize} "Share Tech Mono", monospace`,
                                    fillColor: Cesium.Color.WHITE.withAlpha(0.9),
                                    outlineColor: Cesium.Color.BLACK,
                                    outlineWidth: 2,
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, maxDist)
                                });
                            }
                        }
                    });
                    this.viewer.dataSources.add(citiesGlobalDS);
                } catch(e) {
                    console.log('Cities not loaded yet');
                }
                
                // Load Custom City Markers with Arabic Translations
                const citiesDS = new Cesium.CustomDataSource('cities_arabic');
                const cities = [
                    { name: 'القدس/Al Quds', lon: 35.2137, lat: 31.7683 },
                    { name: 'حيفا/Haifa', lon: 34.9896, lat: 32.7940 },
                    { name: 'تل أبيب/Tel Aviv', lon: 34.7818, lat: 32.0853 },
                    { name: 'غزة/Gaza', lon: 34.4668, lat: 31.5017 },
                    { name: 'أريحا/Jericho', lon: 35.4599, lat: 31.8628 },
                    { name: 'نابلس/Nablus', lon: 35.2620, lat: 32.2211 },
                    { name: 'رام الله/Ramallah', lon: 35.2016, lat: 31.9038 }
                ];

                cities.forEach(city => {
                    citiesDS.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 1000),
                        point: {
                            pixelSize: 6,
                            color: Cesium.Color.fromCssColorString('#00ff00'),
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 2,
                            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000)
                        },
                        label: {
                            text: city.name,
                            font: 'bold 14px "Share Tech Mono", monospace',
                            fillColor: Cesium.Color.WHITE,
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 4,
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(0, -10),
                            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000)
                        }
                    });
                });
                
                this.viewer.dataSources.add(citiesDS);

            } catch (e) {
                console.warn('Failed to load map data:', e);
            }
        };
        initProvider();

        // Dark styling
        this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0a0a');
        this.viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a0a0a');
        this.viewer.scene.globe.enableLighting = false;
        this.viewer.scene.fog.enabled = true;
        this.viewer.scene.fog.density = 0.0001;

        if (this.viewer.scene.skyAtmosphere) {
            this.viewer.scene.skyAtmosphere.brightnessShift = -0.3;
            this.viewer.scene.skyAtmosphere.saturationShift = -0.5;
        }

        // Initialize Data Sources
        this.dataSources.flights = new Cesium.CustomDataSource('flights');
        this.dataSources.satellites = new Cesium.CustomDataSource('satellites');
        this.dataSources.earthquakes = new Cesium.CustomDataSource('earthquakes');
        this.dataSources.weather = new Cesium.CustomDataSource('weather');
        this.dataSources.cctv = new Cesium.CustomDataSource('cctv');
        this.dataSources.nuclear = new Cesium.CustomDataSource('nuclear');
        this.dataSources.military = new Cesium.CustomDataSource('military');
        this.dataSources.conflicts = new Cesium.CustomDataSource('conflicts');
        this.dataSources.waterways = new Cesium.CustomDataSource('waterways');
        this.dataSources.hotspots = new Cesium.CustomDataSource('hotspots');
        this.dataSources.cables = new Cesium.CustomDataSource('cables');
        this.dataSources.naturalEvents = new Cesium.CustomDataSource('naturalEvents');
        this.dataSources.wildfires = new Cesium.CustomDataSource('wildfires');
        this.dataSources.weatherAlerts = new Cesium.CustomDataSource('weatherAlerts');
        this.dataSources.spaceports = new Cesium.CustomDataSource('spaceports');
        this.dataSources.economic = new Cesium.CustomDataSource('economic');

        Object.values(this.dataSources).forEach(ds => {
            this.viewer.dataSources.add(ds);
        });

        // Camera Tracking
        this.viewer.camera.changed.addEventListener(() => {
            if (this.onCameraChange) {
                const cartographic = this.viewer.camera.positionCartographic;
                this.onCameraChange({
                    latitude: Cesium.Math.toDegrees(cartographic.latitude),
                    longitude: Cesium.Math.toDegrees(cartographic.longitude),
                    altitude: cartographic.height,
                    heading: Cesium.Math.toDegrees(this.viewer.camera.heading)
                });
            }
        });

        // Entity Clicking
        this.viewer.screenSpaceEventHandler.setInputAction((click) => {
            const pickedObject = this.viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id && this.onEntityClick) {
                const entity = pickedObject.id;
                if (entity.properties) {
                    const props = {};
                    entity.properties.propertyNames.forEach(name => {
                        props[name] = entity.properties[name].getValue();
                    });
                    this.onEntityClick(props);
                }
            } else if (this.onMapClick) {
                const cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
                if (cartesian) {
                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    this.onMapClick({
                        latitude: Cesium.Math.toDegrees(cartographic.latitude),
                        longitude: Cesium.Math.toDegrees(cartographic.longitude)
                    });
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Mouse Hover
        this.viewer.screenSpaceEventHandler.setInputAction((movement) => {
            if (this.onMouseMove) {
                const cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
                if (cartesian) {
                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    this.onMouseMove({
                        latitude: Cesium.Math.toDegrees(cartographic.latitude),
                        longitude: Cesium.Math.toDegrees(cartographic.longitude)
                    });
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Initial view (Washington DC)
        this.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(-77.0369, 38.9072, 10000000)
        });

        console.log('Terra5 Globe initialized');
    }

    flyTo(lat, lon, alt, duration = 2.0) {
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
            duration: duration,
            easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
        });
    }

    // --- Data Updates ---
    updateFlights(flights) {
        const ds = this.dataSources.flights;
        ds.entities.removeAll();

        flights.forEach(flight => {
            if (!flight.longitude || !flight.latitude) return;

            ds.entities.add({
                id: flight.icao24,
                position: Cesium.Cartesian3.fromDegrees(
                    flight.longitude,
                    flight.latitude,
                    (flight.altitude || 0) + 100
                ),
                billboard: {
                    image: this._createAircraftSVG(flight.heading || 0),
                    width: 24,
                    height: 24,
                    color: Cesium.Color.fromCssColorString('#00d4aa')
                },
                label: {
                    text: flight.callsign || flight.icao24,
                    font: '11px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#00d4aa'),
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(0, -20),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000)
                },
                properties: flight
            });
        });
    }

    updateSatellites(satellites) {
        const ds = this.dataSources.satellites;
        ds.entities.removeAll();
        const icon = this._makeIcon('🛰️', 36);

        satellites.forEach(sat => {
            if (!sat.longitude || !sat.latitude) return;

            ds.entities.add({
                id: `sat-${sat.noradId}`,
                position: Cesium.Cartesian3.fromDegrees(
                    sat.longitude,
                    sat.latitude,
                    (sat.altitude || 400) * 1000
                ),
                billboard: {
                    image: icon, width: 20, height: 20,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
                },
                label: {
                    text: sat.name,
                    font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#00ffaa'),
                    pixelOffset: new Cesium.Cartesian2(10, 0),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000)
                },
                properties: sat
            });
        });
    }

    updateWeather(weatherStations) {
        const ds = this.dataSources.weather;
        ds.entities.removeAll();

        const wxEmojis = ['🌡️', '🌦️', '🌧️', '⛈️', '🌪️'];
        const colors = [
            Cesium.Color.fromCssColorString('#00d4aa'), // None
            Cesium.Color.fromCssColorString('#44ff44'), // Light
            Cesium.Color.fromCssColorString('#ffff44'), // Moderate
            Cesium.Color.fromCssColorString('#ff8844'), // Heavy
            Cesium.Color.fromCssColorString('#ff4444')  // Extreme
        ];

        weatherStations.forEach(wx => {
            const lvl = wx.precipitationLevel || 0;
            const emoji = wxEmojis[lvl] || '🌡️';
            const icon = this._makeIcon(emoji, 36);
            ds.entities.add({
                id: wx.id,
                position: Cesium.Cartesian3.fromDegrees(wx.longitude, wx.latitude),
                billboard: {
                    image: icon, width: 20, height: 20,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
                },
                label: {
                    text: `WXR: ${wx.condition.toUpperCase()}`,
                    font: '10px "Share Tech Mono", monospace',
                    fillColor: colors[lvl],
                    pixelOffset: new Cesium.Cartesian2(0, 15),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000000)
                },
                properties: wx
            });
        });
    }

    updateCCTV(cameras) {
        const ds = this.dataSources.cctv;
        ds.entities.removeAll();

        cameras.forEach(cam => {
            ds.entities.add({
                id: cam.id,
                position: Cesium.Cartesian3.fromDegrees(cam.longitude, cam.latitude),
                billboard: {
                    image: this._createCCTVSVG(),
                    width: 20,
                    height: 20,
                    color: cam.status === 'Recording' ? Cesium.Color.fromCssColorString('#ff3333') : Cesium.Color.fromCssColorString('#00d4aa')
                },
                label: {
                    text: cam.name,
                    font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#00d4aa'),
                    pixelOffset: new Cesium.Cartesian2(15, 0),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000)
                },
                properties: cam
            });
        });
    }

    updateEarthquakes(earthquakes) {
        const ds = this.dataSources.earthquakes;
        ds.entities.removeAll();

        earthquakes.forEach(eq => {
            if (!eq.longitude || !eq.latitude) return;
            const size = Math.max(10000, eq.magnitude * 20000);

            ds.entities.add({
                id: `eq-${eq.id}`,
                position: Cesium.Cartesian3.fromDegrees(eq.longitude, eq.latitude),
                ellipse: {
                    semiMinorAxis: size,
                    semiMajorAxis: size,
                    material: Cesium.Color.fromCssColorString('#ff4444').withAlpha(0.5),
                    outline: true,
                    outlineColor: Cesium.Color.fromCssColorString('#ff4444'),
                    outlineWidth: 2
                },
                label: {
                    text: `M${eq.magnitude.toFixed(1)}`,
                    font: '11px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#ff4444'),
                    pixelOffset: new Cesium.Cartesian2(0, -20),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000000)
                },
                properties: eq
            });
        });
    }

    updateNuclear(facilities) {
        const ds = this.dataSources.nuclear;
        ds.entities.removeAll();
        const icon = this._makeIcon('☢️', 48);
        facilities.forEach(fac => {
            ds.entities.add({
                id: `nuc-${fac.id}`,
                position: Cesium.Cartesian3.fromDegrees(fac.lon, fac.lat),
                billboard: {
                    image: icon, width: 28, height: 28,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000)
                },
                label: {
                    text: fac.name, font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#ffaa00'),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 20),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000)
                },
                properties: fac
            });
        });
    }

    updateMilitary(bases) {
        const ds = this.dataSources.military;
        ds.entities.removeAll();
        const icon = this._makeIcon('🏛️', 44);
        bases.forEach(base => {
            ds.entities.add({
                id: `mil-${base.id}`,
                position: Cesium.Cartesian3.fromDegrees(base.lon, base.lat),
                billboard: {
                    image: icon, width: 24, height: 24,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
                },
                label: {
                    text: base.name, font: '9px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#00aaff'),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 18),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000)
                },
                properties: base
            });
        });
    }

    updateConflicts(zones) {
        const ds = this.dataSources.conflicts;
        ds.entities.removeAll();
        zones.forEach(zone => {
            if (!zone.coords || zone.coords.length < 3) return;
            const positions = Cesium.Cartesian3.fromDegreesArray(zone.coords.flat());
            ds.entities.add({
                id: `conf-${zone.id}`,
                polygon: {
                    hierarchy: positions,
                    material: Cesium.Color.fromCssColorString('#ff0044').withAlpha(0.2),
                    outline: true,
                    outlineColor: Cesium.Color.fromCssColorString('#ff0044'),
                    outlineWidth: 2
                },
                position: Cesium.Cartesian3.fromDegrees(zone.coords[0][0], zone.coords[0][1]),
                label: {
                    text: zone.name.toUpperCase(),
                    font: '12px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#ff0044'),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
                },
                properties: zone
            });
        });
    }

    // ═══ STRATEGIC WATERWAYS ═══
    updateWaterways(waterways) {
        const ds = this.dataSources.waterways;
        ds.entities.removeAll();
        const icon = this._makeIcon('⚓', 48);
        waterways.forEach(w => {
            ds.entities.add({
                id: `ww-${w.id}`,
                position: Cesium.Cartesian3.fromDegrees(w.lon, w.lat),
                billboard: {
                    image: icon, width: 26, height: 26,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000)
                },
                label: {
                    text: w.name, font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#00bfff'),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 20),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000)
                },
                properties: w
            });
        });
    }

    // ═══ INTEL HOTSPOTS ═══
    updateHotspots(hotspots) {
        const ds = this.dataSources.hotspots;
        ds.entities.removeAll();
        const colors = { high: '#ff0044', elevated: '#ff8800', medium: '#ffcc00', low: '#44ff88' };
        hotspots.forEach(h => {
            const c = colors[h.level] || '#ffcc00';
            const icon = this._makeIcon('🎯', 48);
            ds.entities.add({
                id: `hs-${h.id}`,
                position: Cesium.Cartesian3.fromDegrees(h.lon, h.lat),
                billboard: {
                    image: icon, width: 28, height: 28,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000)
                },
                ellipse: {
                    semiMajorAxis: h.level === 'high' ? 200000 : 150000,
                    semiMinorAxis: h.level === 'high' ? 200000 : 150000,
                    material: Cesium.Color.fromCssColorString(c).withAlpha(0.1),
                    outline: true, outlineColor: Cesium.Color.fromCssColorString(c).withAlpha(0.4)
                },
                label: {
                    text: h.name, font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString(c),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 22),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
                },
                properties: { ...h, description: h.description }
            });
        });
    }

    // ═══ UNDERSEA CABLES ═══
    updateCables(cables) {
        const ds = this.dataSources.cables;
        ds.entities.removeAll();
        const icon = this._makeIcon('🔌', 40);
        cables.forEach(cable => {
            if (!cable.points || cable.points.length < 2) return;
            const degs = cable.points.flatMap(p => [p[0], p[1]]);
            ds.entities.add({
                id: `cable-${cable.id}`,
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray(degs),
                    width: 2,
                    material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.3, color: Cesium.Color.fromCssColorString('#00ccff') }),
                    clampToGround: true
                },
                position: Cesium.Cartesian3.fromDegrees(cable.points[0][0], cable.points[0][1]),
                billboard: {
                    image: icon, width: 22, height: 22,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
                },
                label: {
                    text: cable.name, font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#00ccff'),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 18),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000)
                },
                properties: cable
            });
        });
    }

    // ═══ NATURAL EVENTS (NASA EONET) ═══
    updateNaturalEvents(events) {
        const ds = this.dataSources.naturalEvents;
        ds.entities.removeAll();
        const catEmojis = { volcanoes: '🌋', severeStorms: '🌀', wildfires: '🔥', seaLakeIce: '🧊' };
        const catColors = { volcanoes: '#ff4400', severeStorms: '#8844ff', wildfires: '#ff6600', seaLakeIce: '#44ddff' };
        events.forEach(e => {
            const emoji = catEmojis[e.categoryId] || '🌍';
            const col = catColors[e.categoryId] || '#ff8844';
            const icon = this._makeIcon(emoji, 44);
            ds.entities.add({
                id: `neo-${e.id}`,
                position: Cesium.Cartesian3.fromDegrees(e.longitude, e.latitude),
                billboard: {
                    image: icon, width: 24, height: 24,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
                },
                label: {
                    text: e.title.slice(0, 25), font: '9px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString(col),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 18),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4000000)
                },
                properties: e
            });
        });
    }

    // ═══ WILDFIRES (NASA FIRMS) ═══
    updateWildfires(fires) {
        const ds = this.dataSources.wildfires;
        ds.entities.removeAll();
        const icon = this._makeIcon('🔥', 36);
        fires.forEach((f, i) => {
            ds.entities.add({
                id: `fire-${i}`,
                position: Cesium.Cartesian3.fromDegrees(f.longitude, f.latitude),
                billboard: {
                    image: icon, width: 16, height: 16,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000)
                }
            });
        });
    }

    // ═══ WEATHER ALERTS (NWS) ═══
    updateWeatherAlerts(alerts) {
        const ds = this.dataSources.weatherAlerts;
        ds.entities.removeAll();
        const sevEmojis = { Extreme: '🌪️', Severe: '⛈️', Moderate: '🌧️', Minor: '🌦️' };
        const sevColors = { Extreme: '#ff0044', Severe: '#ff6600', Moderate: '#ffcc00', Minor: '#44aaff' };
        alerts.forEach(a => {
            if (!a.centroid) return;
            const emoji = sevEmojis[a.severity] || '🌦️';
            const col = sevColors[a.severity] || '#888';
            const icon = this._makeIcon(emoji, 40);
            ds.entities.add({
                id: `wx-${a.id}`,
                position: Cesium.Cartesian3.fromDegrees(a.centroid[0], a.centroid[1]),
                billboard: {
                    image: icon, width: 20, height: 20,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000)
                },
                label: {
                    text: a.event, font: '9px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString(col),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 16),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000)
                },
                properties: a
            });
        });
    }

    // ═══ SPACEPORTS ═══
    updateSpaceports(spaceports) {
        const ds = this.dataSources.spaceports;
        ds.entities.removeAll();
        const icon = this._makeIcon('🚀', 48);
        spaceports.forEach(sp => {
            ds.entities.add({
                id: `sp-${sp.id}`,
                position: Cesium.Cartesian3.fromDegrees(sp.lon, sp.lat),
                billboard: {
                    image: icon, width: 26, height: 26,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000)
                },
                label: {
                    text: sp.name, font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#ff44ff'),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 20),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000)
                },
                properties: sp
            });
        });
    }

    // ═══ ECONOMIC CENTERS ═══
    updateEconomicCenters(centers) {
        const ds = this.dataSources.economic;
        ds.entities.removeAll();
        const icon = this._makeIcon('💰', 48);
        centers.forEach(ec => {
            ds.entities.add({
                id: `ec-${ec.id}`,
                position: Cesium.Cartesian3.fromDegrees(ec.lon, ec.lat),
                billboard: {
                    image: icon, width: 26, height: 26,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000)
                },
                label: {
                    text: ec.name, font: '10px "Share Tech Mono", monospace',
                    fillColor: Cesium.Color.fromCssColorString('#44ff88'),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
                    pixelOffset: new Cesium.Cartesian2(0, 20),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000)
                },
                properties: ec
            });
        });
    }


    setLayerVisibility(layer, visible) {
        if (this.dataSources[layer]) {
            this.dataSources[layer].show = visible;
        }
    }

    // --- Visual Modes ---
    setVisualMode(mode) {
        console.log("Setting visual mode:", mode);
        this.currentMode = mode;
        this.viewer.scene.postProcessStages.removeAll();

        switch (mode) {
            case 'crt': this.applyCRTEffect(); break;
            case 'nvg': this.applyNVGEffect(); break;
            case 'flir': this.applyFLIREffect(); break;
            case 'noir': this.applyNoirEffect(); break;
            case 'anime': this.applyAnimeEffect(); break;
            case 'snow': this.applySnowEffect(); break;
            default: break; // normal
        }
    }

    applyCRTEffect() {
        const stage = new Cesium.PostProcessStage({
            fragmentShader: `
                uniform sampler2D colorTexture;
                in vec2 v_textureCoordinates;
                void main() {
                    vec2 uv = v_textureCoordinates;
                    vec4 color = texture(colorTexture, uv);
                    float scanline = sin(uv.y * 800.0) * 0.04;
                    color.rgb -= scanline;
                    color.r *= 0.85; color.b *= 0.85; color.g *= 1.1;
                    float vignette = 1.0 - length((uv - 0.5) * 1.3);
                    color.rgb *= vignette;
                    float aberration = 0.001;
                    color.r = texture(colorTexture, uv + vec2(aberration, 0.0)).r * 0.85;
                    color.b = texture(colorTexture, uv - vec2(aberration, 0.0)).b * 0.85;
                    out_FragColor = color;
                }`
        });
        this.viewer.scene.postProcessStages.add(stage);
    }

    applyNVGEffect() {
        const stage = new Cesium.PostProcessStage({
            fragmentShader: `
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
                }`
        });
        this.viewer.scene.postProcessStages.add(stage);
    }

    applyFLIREffect() {
        const stage = new Cesium.PostProcessStage({
            fragmentShader: `
                uniform sampler2D colorTexture;
                in vec2 v_textureCoordinates;
                void main() {
                    vec4 color = texture(colorTexture, v_textureCoordinates);
                    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    vec3 thermal;
                    if (luma < 0.25) { thermal = mix(vec3(0.0, 0.0, 0.1), vec3(0.3, 0.0, 0.4), luma * 4.0); }
                    else if (luma < 0.5) { thermal = mix(vec3(0.3, 0.0, 0.4), vec3(0.8, 0.2, 0.0), (luma - 0.25) * 4.0); }
                    else if (luma < 0.75) { thermal = mix(vec3(0.8, 0.2, 0.0), vec3(1.0, 0.9, 0.0), (luma - 0.5) * 4.0); }
                    else { thermal = mix(vec3(1.0, 0.9, 0.0), vec3(1.0, 1.0, 1.0), (luma - 0.75) * 4.0); }
                    out_FragColor = vec4(thermal, 1.0);
                }`
        });
        this.viewer.scene.postProcessStages.add(stage);
    }

    applyNoirEffect() {
        const stage = new Cesium.PostProcessStage({
            fragmentShader: `
                uniform sampler2D colorTexture;
                in vec2 v_textureCoordinates;
                void main() {
                    vec4 color = texture(colorTexture, v_textureCoordinates);
                    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    luma = pow(luma, 0.7); luma = smoothstep(0.1, 0.9, luma);
                    vec3 noir = vec3(luma * 1.0, luma * 0.95, luma * 0.9);
                    float vignette = 1.0 - length((v_textureCoordinates - 0.5) * 1.2);
                    noir *= vignette;
                    out_FragColor = vec4(noir, 1.0);
                }`
        });
        this.viewer.scene.postProcessStages.add(stage);
    }

    applyAnimeEffect() {
        const stage = new Cesium.PostProcessStage({
            fragmentShader: `
                uniform sampler2D colorTexture;
                in vec2 v_textureCoordinates;
                void main() {
                    vec4 color = texture(colorTexture, v_textureCoordinates);
                    float levels = 6.0;
                    color.rgb = floor(color.rgb * levels) / levels;
                    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    color.rgb = mix(vec3(luma), color.rgb, 1.5);
                    vec2 texelSize = 1.0 / vec2(1920.0, 1080.0);
                    float edge = 0.0;
                    for (int x = -1; x <= 1; x++) {
                        for (int y = -1; y <= 1; y++) {
                            if (x == 0 && y == 0) continue;
                            vec4 neighbor = texture(colorTexture, v_textureCoordinates + vec2(float(x), float(y)) * texelSize * 2.0);
                            edge += length(color.rgb - neighbor.rgb);
                        }
                    }
                    edge = edge > 0.3 ? 1.0 : 0.0;
                    color.rgb = mix(color.rgb, vec3(0.0), edge * 0.5);
                    out_FragColor = color;
                }`
        });
        this.viewer.scene.postProcessStages.add(stage);
    }

    applySnowEffect() {
        const stage = new Cesium.PostProcessStage({
            fragmentShader: `
                uniform sampler2D colorTexture;
                in vec2 v_textureCoordinates;
                void main() {
                    vec4 color = texture(colorTexture, v_textureCoordinates);
                    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    color.rgb = mix(color.rgb, vec3(luma), 0.7);
                    color.r *= 0.85; color.g *= 0.92; color.b *= 1.15;
                    color.rgb = pow(color.rgb, vec3(0.9));
                    float noise = fract(sin(dot(v_textureCoordinates * 500.0, vec2(12.9898, 78.233))) * 43758.5453);
                    color.rgb += noise * 0.02;
                    out_FragColor = color;
                }`
        });
        this.viewer.scene.postProcessStages.add(stage);
    }

    _createAircraftSVG(heading) {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.translate(16, 16);
        ctx.rotate((heading || 0) * Math.PI / 180);
        ctx.translate(-16, -16);
        ctx.fillStyle = '#00d4aa';
        ctx.beginPath();
        ctx.moveTo(16, 4); ctx.lineTo(24, 28);
        ctx.lineTo(16, 22); ctx.lineTo(8, 28);
        ctx.closePath(); ctx.fill();
        return canvas.toDataURL();
    }

    _createCCTVSVG() {
        const canvas = document.createElement('canvas');
        canvas.width = 24; canvas.height = 24;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        // Base
        ctx.fillRect(8, 16, 8, 4);
        // Stand
        ctx.fillRect(10, 10, 4, 6);
        // Camera body
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(20, 8);
        ctx.lineTo(20, 14);
        ctx.lineTo(4, 10);
        ctx.closePath();
        ctx.fill();
        return canvas.toDataURL();
    }
}
