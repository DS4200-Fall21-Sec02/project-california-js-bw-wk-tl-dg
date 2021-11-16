// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 

console.log('Hello, world!');

d3.csv("data/california_data_dump.csv").then(function(data1) {
	console.log(data1);

})

// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()
    .center([2, 47])                // GPS of location to zoom on
    .scale(4500)                       // This is like the zoom
    .translate([ 10000, -500])

// Load external data and boot
d3.json("https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/california-counties.geojson").then( function(data){

    // Filter data
    // data.features = data.features.filter(d => {console.log(d.properties.name); return d.properties.name=="France"})

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
          .attr("fill", "grey")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "none")
})
