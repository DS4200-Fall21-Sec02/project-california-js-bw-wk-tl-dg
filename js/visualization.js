// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 

console.log('Hello, world!');

d3.csv("data/california_data_dump.csv").then(function(data1) {
	console.log(data1);

})

const svg = d3
	.select("#vis-svg-1")
	.append("svg")
	.attr("width", 100)
	.attr("height", 100);

// Map and projection
const projection = d3.geoMercator()
    .center([2, 47])                // GPS of location to zoom on
    .scale(980)                       // This is like the zoom
    .translate([ width/2, height/2 ])

// Load external data and boot
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(data){
	svg.append("g")
	.selectAll("path")
	.data(data.features)
	.join("path")
	  .attr("fill", "grey")
	  .attr("d", d3.geoPath()
		  .projection(projection)
	  )
	.style("stroke", "none")
}
