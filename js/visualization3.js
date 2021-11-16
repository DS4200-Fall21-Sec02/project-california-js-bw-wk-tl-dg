// Immediately Invoked Function Expression to limit access to our
// variables and prevent

let countyCrimeData = {};

d3.csv('data/california_data_dump.csv').then(function (data) {
  for (let d of data) {
    countyCrimeData[d.County] = {
      violent: parseFloat(d.Violent.replaceAll(',', '')),
      population: parseInt(d.Population.replaceAll(',', '')),
    };
  }
});

// The svg
const svg = d3.select('svg'),
  width = +svg.attr('width'),
  height = +svg.attr('height');

// Map and projection
const projection = d3
  .geoMercator()
  .center([1, 47]) // GPS of location to zoom on
  .scale(2700) // This is like the zoom
  .translate([5900, -300]);

// Load external data and boot
d3.json(
  'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/california-counties.geojson'
).then(function (data) {
  // Filter data
  // data.features = data.features.filter(d => {console.log(d.properties.name); return d.properties.name=="France"})

  // Draw the map
  svg
    .append('g')
    .selectAll('path')
    .data(data.features)
    .join('path')
    .style('border', '1px solid #BDBDBD')
    .attr('fill', function (d) {
      if (countyCrimeData[d.properties.name].violent < 49) {
        return '#1daee510';
      } else if (
        countyCrimeData[d.properties.name].violent > 49 &&
        countyCrimeData[d.properties.name].violent < 99
      ) {
        return '#1daee520';
      } else if (
        countyCrimeData[d.properties.name].violent > 99 &&
        countyCrimeData[d.properties.name].violent < 149
      ) {
        return '#1daee530';
      } else if (
        countyCrimeData[d.properties.name].violent > 149 &&
        countyCrimeData[d.properties.name].violent < 199
      ) {
        return '#1daee540';
      } else if (
        countyCrimeData[d.properties.name].violent > 199 &&
        countyCrimeData[d.properties.name].violent < 299
      ) {
        return '#1daee550';
      } else if (
        countyCrimeData[d.properties.name].violent > 299 &&
        countyCrimeData[d.properties.name].violent < 399
      ) {
        return '#1daee560';
      } else if (
        countyCrimeData[d.properties.name].violent > 399 &&
        countyCrimeData[d.properties.name].violent < 499
      ) {
        return '#1daee570';
      } else if (
        countyCrimeData[d.properties.name].violent > 499 &&
        countyCrimeData[d.properties.name].violent < 599
      ) {
        return '#1daee580';
      } else if (countyCrimeData[d.properties.name].violent > 599) {
        return '#1daee5';
      }
    })
    .attr('d', d3.geoPath().projection(projection));
});
