var url = 'data/all_week.geojson';
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

var colors = ['Blue', 'Green', 'Salmon', 'Orange', 'yellow', 'red'];

function getFilled(Temp) {
    return Temp > 90 ? colors[5] :
           Temp > 70 ? colors[4] :
           Temp > 50 ? colors[3] :
           Temp > 30 ? colors[2] :
           Temp > 10 ? colors[1] :
           Temp > -10 ? colors[0] :
           colors[5]; // Use the last color for values outside the range
}

d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    console.log(earthquakeData);

    function doONEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><ul><li>Earthquake Magnitude: ${feature.properties.mag}</li><li>Earthquake Depth: ${feature.geometry.coordinates[2]}</li></ul>`);
    }

    var earthquakes = L.geoJson(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 3,
                fillColor: getFilled(feature.geometry.coordinates[2]),
                color: "black",
                weight: 0.2,
                opacity: 0.3
            });
        },
        onEachFeature: doONEachFeature
    });

    function createMap(earthquakes) {
        var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        });

        var baseMaps = {
            "Street Map": street,
            "Topographic Map": topo,
            "Dark Map": dark
        };

        var overlayMaps = {
            Earthquakes: earthquakes
        };

        var map = L.map("map", {
            center: [37.09, -95.71],
            zoom: 4,
            layers: [street, earthquakes]
        });

        var legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
            var div = L.DomUtil.create('div', 'info legend');
            for (var i = 0; i < colors.length; i++) {
                var item = `<li style='background: ${colors[i]}'></li> ${i * 20} - ${i * 20 + 20}<br>`;
                div.innerHTML += item;
            }
            return div;
        };
        legend.addTo(map);

        // Calculate the average latitude and longitude of all earthquake locations
        var avgLat = 0;
        var avgLng = 0;
        earthquakeData.forEach(function(feature) {
            avgLat += feature.geometry.coordinates[1];
            avgLng += feature.geometry.coordinates[0];
        });
        avgLat /= earthquakeData.length;
        avgLng /= earthquakeData.length;

        // Draw a line representing the average position of all earthquake locations
        var avgLine = L.polyline([[avgLat, avgLng]], {color: 'red'}).addTo(map);

        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(map);
    }

    createMap(earthquakes);
}