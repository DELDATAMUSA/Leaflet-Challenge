function createMap() {
  // Define outdoors and graymap layers
  let streetstylemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
    maxZoom: 20
  });

  // Create baseMaps object to hold base layers
  let baseMaps = {
    "Street Map": streetstylemap
  };

  // Create overlay group for earthquakes
  let earthquakes = L.layerGroup();

  // Fetch earthquake data from USGS GeoJSON Feed
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
      // Loop through each earthquake feature
      data.features.forEach(feature => {
        // Extract necessary information
        let coords = feature.geometry.coordinates;
        let magnitude = feature.properties.mag;
        let depth = coords[2];
        let place = feature.properties.place;

        // Create marker with size and color based on magnitude and depth
        let marker = L.circleMarker([coords[1], coords[0]], {
          radius: magnitude * 3, // Adjust multiplier for desired marker size
          fillColor: getColor(depth), // Use getColor function to assign color based on depth
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });

        // Bind popup with additional information
        marker.bindPopup(`<b>Location:</b> ${place}<br><b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth} km`);

        // Add marker to earthquakes layer
        marker.addTo(earthquakes);
      });

      // Add earthquakes overlay to overlayMaps object
      let overlayMaps = {
        "Earthquakes": earthquakes
      };

      // Create map and add layers
      let myMap = L.map("map", {
        center: [39.8282, -98.5795],
        zoom: 4,
        layers: [streetstylemap, earthquakes]
      });

      // Add layer control to map
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

      // Add legend
      let legend = L.control({position: 'bottomright'});
      legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 50, 70, 90];
        div.innerHTML += '<b>Depth (km)</b><br>';
        for (let i = 0; i < depths.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
      };
      legend.addTo(myMap);
    });

  // Function to assign color based on depth
  function getColor(depth) {
    return depth > 90 ? '#800026' :
           depth > 70 ? '#BD0026' :
           depth > 50 ? '#E31A1C' :
           depth > 30 ? '#FC4E2A' :
           depth > 10 ? '#FD8D3C' :
                        '#FEB24C';
  }
}

// Call createMap function to generate the map
createMap();
