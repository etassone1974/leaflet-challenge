// Store our API endpoint as queryUrl
// All earthquakes for the last seven days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Store the URL for the tectonic plates JSON
var queryUrl_TectonicPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Create variable to hold tectonic plates data
var tectonicData;

// Query tectonic plates URL first so can be passed into createFeatures function
// with earthquake data
// Perform a GET request to the query URL for the tectonic plates
d3.json(queryUrl_TectonicPlates).then(function(data, err) {

    // Once we get a response, set the data.features object to the global variable tectonicData
    tectonicData = data.features;

// Error handling
}).catch(function(error) {
    console.log(error);
});

// Perform a GET request to the query URL for earthquakes
d3.json(queryUrl).then(function(data, err) {

    // Print out data to console for checking purposes  
    console.log(data.features[0]);
    console.log(data.features.length);
    console.log(data.features[0].geometry.coordinates[1]);
    console.log(data.features[0].geometry.coordinates[0]);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);

// Error handling
}).catch(function(error) {
    console.log(error);
});

// Function to set the colour based on the magnitude of the earthquake
// Also used to list colours in legend
// Values and colours set based on example image in instructions
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

// Create an empty list for markers for each earthquake
var earthquakeMarkers = [];

// Function to set and draw circles for earthquake markers and popups when clicking on circles
function createFeatures(earthquakeData) {

    // Create a GeoJSON layer containing the tectonic plates features and store in variable
    // Set the colour of the fault lines to orange
    var tectonicPlates = L.geoJSON(tectonicData, {
        style: function() {
            return {
              color: "orange",
              fillOpacity: 0
            }
          }
    }); 

    // Loop over all the earthquakes returned from the JSON response
    // Push each earthquake into the list of markers with a circle with the given properties
    // Set the circle's colour and radius based on its magnitude
    for (var i = 0; i < earthquakeData.length; i++) {
        earthquakeMarkers.push(
            L.circle([earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]], {
            fillOpacity: 1,
            color: "black",
            stroke: true,
            weight: 0.5,
            fillColor: colorStyle(earthquakeData[i].properties.mag),
            radius: earthquakeData[i].properties.mag*10000

        // Create popup for each earthquake when its circle is clicked on
        // Display its location, magnitude and time
        }).bindPopup("<h3>" + earthquakeData[i].properties.place + "<br>Magnitude: " + earthquakeData[i].properties.mag +
        "</h3><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>").on('click',function(ev) {
            ev.target.openPopup();
        })
    )}
    
    // Assign the earthquake markers to a layer
    var earthquakes = L.layerGroup(earthquakeMarkers);

    // Sending our earthquakes and tectonicPlates layers to the createMap function
    createMap(earthquakes, tectonicPlates);

}

  // Function to create and display the base map and earthquake layer
  function createMap(earthquakes, tectonicPlates) {
  
    // Define lightmap layer
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    });
  
    // Define satellitemap layer
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-streets-v11",
        accessToken: API_KEY
    });

    // Define outdoorsmap layer
    var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Grayscale": lightmap,
      "Satellite": satellitemap,
      "Outdoors" : outdoorsmap
    };
  
    // Create overlay object to hold our overlay layers of the earthquakes and fault lines
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": tectonicPlates
    };
  
    // Create our map, giving it the lightmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [lightmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
     }).addTo(myMap);

    //  Following code partially adapted from
    //  https://leafletjs.com/examples/choropleth/
    // and in class examples

    // Create a legend for the map at the bottom right
    var legend = L.control({position: 'bottomright'});

    // Add the legend to the map display
	legend.onAdd = function (myMap) {

        // Set up the cutoffs for the magnitudes for the legend, 
        // the empty labels list and the from and to magnitudes
		var div = L.DomUtil.create('div', 'info legend'),
			magnitudes = [0, 1, 2, 3, 4, 5],
			labels = [],
			from, to;
        
        // Set the from and to magnitude for all levels of magitude
        // Levels are: 0-1, 1-2, 2-3, 3-4, 4-5, 5+
        // Push the levels and the correct colour on to the labels list
		for (var i = 0; i < magnitudes.length; i++) {
			from = magnitudes[i];
			to = magnitudes[i + 1];

			labels.push(
				'<i style="background:' + colorStyle(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}
        // Add HTML for legend and return div
		div.innerHTML = labels.join('<br>');
		return div;
	};

    // Add legend to map for display
	legend.addTo(myMap);  
  
}
  