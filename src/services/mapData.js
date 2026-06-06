export const MAP_DATA = {
    CONFLICT_ZONES: [
        {
            id: 'iran',
            name: 'Iran War Theater',
            coords: [[44, 39.7], [46, 39.5], [48.5, 38.5], [50.5, 37.5], [53.5, 37.5], [55.5, 38], [57, 37.5], [58.5, 37.5], [61, 36.5], [63.5, 35.5], [63.5, 31.5], [62.5, 29.5], [61, 28], [59, 26.5], [57.5, 25.5], [56.5, 25.5], [55, 26.5], [54, 27], [52.5, 27.5], [50.5, 28.5], [49, 29.5], [47.5, 30], [46, 31.5], [45.5, 33.5], [45.8, 35.5], [46.5, 37], [44, 38.5], [44, 39.7]],
            description: 'Joint US-Israeli military operation. 1000+ targets struck.'
        },
        {
            id: 'strait_hormuz',
            name: 'Strait of Hormuz Crisis',
            coords: [[54.5, 25.5], [55.5, 25], [57, 24.8], [58.5, 25], [58.5, 26.8], [57.5, 27.5], [56, 27.5], [54.5, 27], [54.5, 25.5]],
            description: 'Iran attempting to close Strait of Hormuz.'
        },
        {
            id: 'ukraine',
            name: 'Ukraine War',
            coords: [[22.137, 48.09], [22.558, 49.085], [22.66, 49.79], [23.2, 50.38], [23.82, 51.22], [24.09, 51.89], [25.6, 51.93], [27.85, 52.18], [30.17, 52.1], [32.76, 52.32], [34.4, 51.76], [36.28, 50.3], [38.25, 49.92], [40.18, 49.6], [40.08, 48.88], [39.68, 47.77], [38.21, 47.1], [36.65, 46.58], [35.19, 46.1], [36.47, 45.22], [36, 44.4], [33.55, 44.39], [32.48, 44.52], [31.78, 45.2], [31.44, 46.03], [30.76, 46.38], [29.6, 45.38], [28.21, 45.45], [28.68, 46.45], [28.24, 47.11], [26.62, 48.26], [24.58, 47.96], [22.87, 47.95], [22.137, 48.09]],
            description: 'Full-scale Russian invasion of Ukraine.'
        },
        {
            id: 'gaza',
            name: 'Gaza Conflict',
            coords: [[34, 32], [35, 32], [35, 31], [34, 31]],
            description: 'Israeli military operations in Gaza.'
        },
        {
            id: 'south_lebanon',
            name: 'Israel-Lebanon Border',
            coords: [[35.1, 33.0], [35.1, 33.4], [35.8, 33.4], [35.8, 33.0]],
            description: 'Cross-border artillery and rocket fire.'
        },
        {
            id: 'yemen_redsea',
            name: 'Red Sea Crisis',
            coords: [[42, 12], [42, 16], [44, 16], [45, 13], [44, 12]],
            description: 'Houthi maritime campaign against commercial shipping.'
        },
        {
            id: 'sudan',
            name: 'Sudan Civil War',
            coords: [[30, 17], [34, 17], [34, 13], [30, 13]],
            description: 'Power struggle between SAF and RSF paramilitary.'
        },
        {
            id: 'myanmar',
            name: 'Myanmar Civil War',
            coords: [[95, 22], [98, 22], [98, 18], [95, 18]],
            description: 'Civil war following military coup.'
        }
    ],

    NUCLEAR_FACILITIES: [
        { id: 'los_alamos', name: 'Los Alamos', lat: 35.88, lon: -106.31, type: 'weapons' },
        { id: 'sandia', name: 'Sandia Labs', lat: 35.04, lon: -106.54, type: 'weapons' },
        { id: 'livermore', name: 'LLNL', lat: 37.69, lon: -121.7, type: 'weapons' },
        { id: 'oak_ridge', name: 'Oak Ridge', lat: 35.93, lon: -84.31, type: 'enrichment' },
        { id: 'palo_verde', name: 'Palo Verde', lat: 33.39, lon: -112.86, type: 'plant' },
        { id: 'south_texas', name: 'South Texas', lat: 28.795, lon: -96.048, type: 'plant' },
        { id: 'comanche_peak', name: 'Comanche Peak', lat: 32.30, lon: -97.79, type: 'plant' },
        { id: 'vogtle', name: 'Vogtle', lat: 33.14, lon: -81.76, type: 'plant' },
        { id: 'mcguire', name: 'McGuire', lat: 35.43, lon: -80.95, type: 'plant' },
        { id: 'oconee', name: 'Oconee', lat: 34.79, lon: -82.90, type: 'plant' },
        { id: 'catawba', name: 'Catawba', lat: 35.05, lon: -81.07, type: 'plant' },

        { id: 'gravelines', name: 'Gravelines', lat: 51.01, lon: 2.14, type: 'plant' },
        { id: 'paluel', name: 'Paluel', lat: 49.86, lon: 0.63, type: 'plant' },
        { id: 'cattenom', name: 'Cattenom', lat: 49.42, lon: 6.22, type: 'plant' },
        { id: 'bugey', name: 'Bugey', lat: 45.80, lon: 5.27, type: 'plant' },
        { id: 'tricastin', name: 'Tricastin', lat: 44.33, lon: 4.73, type: 'plant' },
        { id: 'cruas', name: 'Cruas', lat: 44.63, lon: 4.76, type: 'plant' },

        { id: 'hinkley_point', name: 'Hinkley Point', lat: 51.21, lon: -3.13, type: 'plant' },
        { id: 'sizewell', name: 'Sizewell', lat: 52.21, lon: 1.62, type: 'plant' },
        { id: 'heysham', name: 'Heysham', lat: 54.03, lon: -2.92, type: 'plant' },

        { id: 'kursk', name: 'Kursk NPP', lat: 51.67, lon: 35.61, type: 'plant' },
        { id: 'novovoronezh', name: 'Novovoronezh', lat: 51.27, lon: 39.22, type: 'plant' },
        { id: 'leningrad', name: 'Leningrad NPP', lat: 59.83, lon: 29.03, type: 'plant' },

        { id: 'zaporizhzhia', name: 'Zaporizhzhia NPP', lat: 47.51, lon: 34.58, type: 'plant' },
        { id: 'rivne', name: 'Rivne NPP', lat: 51.33, lon: 25.88, type: 'plant' },
        { id: 'kori', name: 'Kori', lat: 35.32, lon: 129.29, type: 'plant' },

        { id: 'natanz', name: 'Natanz', lat: 33.72, lon: 51.73, type: 'enrichment' },
        { id: 'fordow', name: 'Fordow', lat: 34.88, lon: 51.0, type: 'enrichment' },
        { id: 'yongbyon', name: 'Yongbyon', lat: 39.8, lon: 125.75, type: 'weapons' },
        { id: 'dimona', name: 'Dimona', lat: 31.0, lon: 35.15, type: 'weapons' },
        { id: 'pakistan_kahuta', name: 'Kahuta', lat: 33.59, lon: 73.40, type: 'enrichment' },
        { id: 'pakistan_khushab', name: 'Khushab', lat: 32.02, lon: 72.22, type: 'weapons' }
    ],

    MILITARY_BASES: [
        { id: 'ream_naval_base', name: 'Ream Naval Base', lat: 10.50340, lon: 103.60900, type: 'china' },
        { id: 'chinese_pla_support_base', name: 'Chinese PLA Support Base', lat: 11.59150, lon: 43.06020, type: 'china' },
        { id: 'ndjamena_air_force_base', name: 'N\'Djamena Air Force Base', lat: 12.13361, lon: 15.03389, type: 'france' },
        { id: 'naval_base_of_hron', name: 'Naval base of Héron', lat: 11.55663, lon: 43.14419, type: 'france' },
        { id: 'port_of_shahid_beheshti', name: 'Port of Shahid Beheshti', lat: 25.29752, lon: 60.61111, type: 'india' },
        { id: 'russian_102nd_military_base', name: 'Russian 102nd Military Base', lat: 40.79000, lon: 43.82500, type: 'russia' },
        { id: 'khmeimim_air_base', name: 'Khmeimim Air Base', lat: 35.41100, lon: 35.94500, type: 'russia' },
        { id: 'hms_jufair', name: 'HMS Jufair', lat: 26.20500, lon: 50.61500, type: 'uk' },
        { id: 'raf_akrotiri', name: 'RAF Akrotiri', lat: 34.59000, lon: 32.98700, type: 'uk' },
        { id: 'andersen_air_force_base', name: 'Andersen Air Force Base', lat: 13.57920, lon: 144.92300, type: 'us-nato' },
        { id: 'naval_support_activity_bahrain', name: 'Naval Support Activity Bahrain', lat: 26.20860, lon: 50.60970, type: 'us-nato' },
        { id: 'ramstein', name: 'Ramstein', lat: 49.44300, lon: 7.77161, type: 'us-nato' },
        { id: 'kadena', name: 'Kadena', lat: 25.77220, lon: 126.66900, type: 'us-nato' },
        { id: 'yokota', name: 'Yokota', lat: 35.73940, lon: 139.34700, type: 'us-nato' },
        { id: 'camp_humphreys', name: 'U.S. Army Garrison Humphreys', lat: 36.96510, lon: 127.03300, type: 'us-nato' },
        { id: 'norfolk', name: 'Norfolk Naval', lat: 36.95, lon: -76.31, type: 'us-nato' },
        { id: 'pendleton', name: 'Camp Pendleton', lat: 33.38, lon: -117.4, type: 'us-nato' },
        { id: 'san_diego', name: 'Naval San Diego', lat: 32.68, lon: -117.13, type: 'us-nato' },
        { id: 'nellis', name: 'Nellis AFB', lat: 36.24, lon: -115.03, type: 'us-nato' },
        { id: 'langley', name: 'Langley AFB', lat: 37.08, lon: -76.36, type: 'us-nato' },
        { id: 'cheyenne', name: 'Cheyenne Mtn', lat: 38.74, lon: -104.85, type: 'us-nato' },
        { id: 'kings_bay', name: 'Kings Bay', lat: 30.8, lon: -81.52, type: 'us-nato' },
        { id: 'kitsap', name: 'Naval Kitsap', lat: 47.56, lon: -122.66, type: 'us-nato' },
        { id: 'yokosuka', name: 'Yokosuka', lat: 35.28, lon: 139.67, type: 'us-nato' },
        { id: 'rota', name: 'Naval Rota', lat: 36.62, lon: -6.35, type: 'us-nato' },
        { id: 'incirlik', name: 'Incirlik AB', lat: 37.0, lon: 35.43, type: 'us-nato' },
        { id: 'kaliningrad', name: 'Kaliningrad', lat: 54.71, lon: 20.51, type: 'russia' },
        { id: 'sevastopol', name: 'Sevastopol', lat: 44.6, lon: 33.5, type: 'russia' },
        { id: 'vladivostok', name: 'Vladivostok', lat: 43.12, lon: 131.9, type: 'russia' },
        { id: 'murmansk', name: 'Murmansk', lat: 68.97, lon: 33.09, type: 'russia' }
    ],

    STRATEGIC_WATERWAYS: [
        { id: 'suez', name: 'Suez Canal', lat: 30.58, lon: 32.27, dailyTraffic: '50+ vessels/day', description: '12% of global trade passes through here' },
        { id: 'hormuz', name: 'Strait of Hormuz', lat: 26.57, lon: 56.25, dailyTraffic: '21M barrels/day', description: '21% of global oil supply' },
        { id: 'malacca', name: 'Strait of Malacca', lat: 2.5, lon: 101.5, dailyTraffic: '94k vessels/year', description: '25% of global shipping' },
        { id: 'bab_el_mandeb', name: 'Bab el-Mandeb', lat: 12.58, lon: 43.33, dailyTraffic: '6M barrels/day', description: 'Gateway to Red Sea / Suez Canal' },
        { id: 'panama', name: 'Panama Canal', lat: 9.08, lon: -79.68, dailyTraffic: '40 vessels/day', description: '5% of global trade, drought-impacted' },
        { id: 'taiwan', name: 'Taiwan Strait', lat: 24.5, lon: 119.0, dailyTraffic: 'High density', description: '88% of largest container ships transit here' },
        { id: 'bosporus', name: 'Bosphorus Strait', lat: 41.12, lon: 29.05, dailyTraffic: '48k vessels/year', description: 'Black Sea access for grain/oil exports' }
    ],

    INTEL_HOTSPOTS: [
        { id: 'sahel', name: 'Sahel', lat: 14.0, lon: -1.0, description: 'Insurgency, military coups, Wagner presence', level: 'high' },
        { id: 'horn_africa', name: 'Horn of Africa', lat: 10.0, lon: 49.0, description: 'Piracy, Al-Shabaab, Somalia crisis', level: 'high' },
        { id: 'dc', name: 'Washington D.C.', lat: 38.9, lon: -77.0, description: 'Pentagon, CIA, NSA — key policy center', level: 'medium' },
        { id: 'silicon_valley', name: 'Silicon Valley', lat: 37.4, lon: -122.1, description: 'AI/Tech hub, economic indicator', level: 'low' },
        { id: 'taiwan_strait', name: 'Taiwan Strait', lat: 24.0, lon: 119.0, description: 'US-China flashpoint, semiconductor supply chain', level: 'elevated' },
        { id: 'north_korea', name: 'Pyongyang', lat: 39.02, lon: 125.75, description: 'Nuclear weapons program, missile tests', level: 'elevated' },
        { id: 'kashmir', name: 'Kashmir', lat: 34.0, lon: 76.0, description: 'India-Pakistan border tensions', level: 'medium' },
        { id: 'south_china_sea', name: 'South China Sea', lat: 15.0, lon: 115.0, description: 'Territorial disputes, freedom of navigation', level: 'elevated' },
        { id: 'arctic', name: 'Arctic', lat: 75.0, lon: 40.0, description: 'Russian military buildup, resource competition', level: 'medium' },
        { id: 'haiti', name: 'Port-au-Prince', lat: 18.5, lon: -72.3, description: 'Gang violence, government collapse', level: 'high' },
        { id: 'venezuelan_crisis', name: 'Venezuela', lat: 10.5, lon: -66.9, description: 'Political crisis, election disputes, migration', level: 'elevated' },
        { id: 'congo', name: 'Eastern Congo', lat: -1.7, lon: 29.2, description: 'M23 offensive, civilian crisis', level: 'high' }
    ],

    SPACEPORTS: [
        { id: 'cape_canaveral', name: 'Cape Canaveral', lat: 28.562, lon: -80.577, country: 'USA', operator: 'NASA/SpaceX' },
        { id: 'vandenberg', name: 'Vandenberg SFB', lat: 34.742, lon: -120.573, country: 'USA', operator: 'USSF/SpaceX' },
        { id: 'baikonur', name: 'Baikonur Cosmodrome', lat: 45.965, lon: 63.305, country: 'Kazakhstan', operator: 'Roscosmos' },
        { id: 'plesetsk', name: 'Plesetsk', lat: 62.93, lon: 40.58, country: 'Russia', operator: 'Roscosmos' },
        { id: 'wenchang', name: 'Wenchang', lat: 19.614, lon: 110.951, country: 'China', operator: 'CNSA' },
        { id: 'jiuquan', name: 'Jiuquan', lat: 40.958, lon: 100.291, country: 'China', operator: 'CNSA' },
        { id: 'satish_dhawan', name: 'Satish Dhawan', lat: 13.72, lon: 80.23, country: 'India', operator: 'ISRO' },
        { id: 'tanegashima', name: 'Tanegashima', lat: 30.4, lon: 131.0, country: 'Japan', operator: 'JAXA' },
        { id: 'kourou', name: 'Kourou', lat: 5.167, lon: -52.65, country: 'French Guiana', operator: 'ESA/Arianespace' },
        { id: 'semnan', name: 'Semnan', lat: 35.234, lon: 53.921, country: 'Iran', operator: 'ISA' }
    ],

    ECONOMIC_CENTERS: [
        { id: 'nyse', name: 'New York (NYSE)', lat: 40.707, lon: -74.011, gdpWeight: 'Very High', description: 'World\'s largest stock exchange by market cap' },
        { id: 'london_city', name: 'London (LSE)', lat: 51.515, lon: -0.089, gdpWeight: 'Very High', description: 'Global financial center, forex capital' },
        { id: 'tokyo', name: 'Tokyo (TSE)', lat: 35.681, lon: 139.767, gdpWeight: 'High', description: '3rd largest economy' },
        { id: 'shanghai', name: 'Shanghai (SSE)', lat: 31.233, lon: 121.469, gdpWeight: 'Very High', description: 'China\'s financial hub' },
        { id: 'hong_kong', name: 'Hong Kong (HKEX)', lat: 22.285, lon: 114.159, gdpWeight: 'High', description: 'Gateway to Chinese markets' },
        { id: 'singapore', name: 'Singapore (SGX)', lat: 1.28, lon: 103.85, gdpWeight: 'High', description: 'Asia-Pacific trading hub' },
        { id: 'frankfurt', name: 'Frankfurt (DAX)', lat: 50.111, lon: 8.682, gdpWeight: 'High', description: 'ECB headquarters, EU finance' },
        { id: 'zurich', name: 'Zürich (SIX)', lat: 47.377, lon: 8.54, gdpWeight: 'High', description: 'Private banking capital' },
        { id: 'dubai', name: 'Dubai (DFM)', lat: 25.204, lon: 55.274, gdpWeight: 'High', description: 'Middle East financial hub' },
        { id: 'mumbai', name: 'Mumbai (BSE)', lat: 18.931, lon: 72.833, gdpWeight: 'High', description: 'India\'s financial capital' }
    ],

    UNDERSEA_CABLES: [
        { id: 'tata_tgn', name: 'TGN-Atlantic', points: [[-74.0, 40.7], [-5.5, 36.0], [-9.1, 38.7]], capacity: '3.2 Tbps' },
        { id: 'seamewe3', name: 'SEA-ME-WE 3', points: [[103.8, 1.3], [72.8, 18.9], [43.1, 11.6], [32.3, 30.6], [12.5, 41.9]], capacity: '0.96 Tbps' },
        { id: 'aae1', name: 'AAE-1', points: [[103.8, 1.3], [72.8, 18.9], [43.1, 11.6], [32.3, 30.6], [13.1, 42.6]], capacity: '40 Tbps' },
        { id: 'marea', name: 'MAREA', points: [[-73.9, 39.5], [-2.5, 37.0]], capacity: '160 Tbps' },
        { id: 'grace_hopper', name: 'Grace Hopper', points: [[-73.9, 40.7], [-5.5, 36.7], [-9.1, 38.7]], capacity: '340 Tbps' },
        { id: 'pacific_crossing', name: 'Pacific Crossing', points: [[-118.3, 33.8], [139.7, 35.3]], capacity: '5.12 Tbps' },
        { id: 'apricot', name: 'APRICOT', points: [[139.6, 35.4], [103.8, 1.3], [121.5, 14.6]], capacity: '190 Tbps' },
        { id: 'equiano', name: 'Equiano', points: [[-9.1, 38.7], [3.4, 6.4], [13.3, -8.8], [18.4, -33.9]], capacity: '144 Tbps' }
    ]
};
