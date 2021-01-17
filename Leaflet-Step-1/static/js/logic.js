// Store our API endpoint as queryUrl
// All earthquakes for the last seven days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data, err) {

    // Print a data point to console for checking purposes  
    console.log(data.features[0]);
    console.log(data.features.length);
    console.log(data.features[0].geometry.coordinates[0]);
    console.log(data.features[0].geometry.coordinates[1]);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);

// Error handling
});

function colorStyle(magnitude){
    
    var color = "";
    if (magnitude > 5) {
      color = "#f06b6b";
    }
    else if (magnitude > 4) {
      color = "#f0a76b";
    }
    else if (magnitude > 3) {
      color = "#f3ba4d";
    }
    else if (magnitude > 2) {
        color = "#f3db4d"
    }
    else if (magnitude > 1) {
        color = "#e1f34d"
    }
    else {
      color = "#b7f34d";
    }
    return color;
}

var earthquakeMarkers = [];

function createFeatures(earthquakeData) {

    for (var i = 0; i < earthquakeData.length; i++) {
        earthquakeMarkers.push(
            L.circle([earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]], {
            fillOpacity: 1,
            color: "black",
            stroke: true,
            weight: 0.5,
            fillColor: colorStyle(earthquakeData[i].properties.mag),
            radius: earthquakeData[i].properties.mag*10000
        }).bindPopup("<h3>" + earthquakeData[i].properties.place + "<br>Magnitude: " + earthquakeData[i].properties.mag +
        "</h3><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>").on('click',function(ev) {
            ev.target.openPopup();
        })
    )}

    var earthquakes = L.layerGroup(earthquakeMarkers);
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

}
  
  function createMap(earthquakes) {
  
    // Define lightmap layer
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Light Map": lightmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [lightmap, earthquakes]
    });

    var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (myMap) {

		var div = L.DomUtil.create('div', 'info legend'),
			magnitudes = [0, 1, 2, 3, 4, 5],
			labels = [],
			from, to;

		for (var i = 0; i < magnitudes.length; i++) {
			from = magnitudes[i];
			to = magnitudes[i + 1];

			labels.push(
				'<i style="background:' + colorStyle(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(myMap);  


  
}
  