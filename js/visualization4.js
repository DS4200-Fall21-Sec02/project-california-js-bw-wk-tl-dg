// Immediately Invoked Function Expression to limit access to our
// variables and prevent

let countyCrimeData = {};

const margin = { top: 20, right: 20, bottom: 70, left: 40 };

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
  // Draw the map
  svg
    .append('g')
    .selectAll('path')
    .data(data.features)
    .join('path')
    .style('border', '20px solid #BDBDBD')
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
    .attr('d', d3.geoPath().projection(projection))
    // d is a mousevent, drill down to find the county name
    .on('mouseover', function (d) {
      console.log(d);
      console.log(d.path[0].__data__.properties.name);
      var xPosition = 5900;
      var yPosition = -300;
      // 						var xPosition = parseFloat(path.centroid(this).attr("cx"));
      // 						var yPosition = parseFloat(path.centroid(this).attr("cy"));
      d3.select('#tooltip')
        .style('position', 'absolute')
        .style('left', d.x + 50 + 'px')
        .style('top', d.y + 500 + 'px')
        .text(d.path[0].__data__.properties.name + ' County')
        .classed('hidden', false);
    })
    .on('mouseout', function () {
      d3.select('#tooltip').classed('hidden', true);
    });

  findTopFive('crime', data.features);
});

//	<div id="tooltip" class="hidden">
//            <p>County: <span id="county">County Name</span></p>
//        </div>

function findTopFive(cat, data) {
  let top5Vals = [];
  let top5Names = [];
  const top5 = data
    .sort(function (a, b) {
      return (
        countyCrimeData[b.properties.name].violent -
        countyCrimeData[a.properties.name].violent
      );
    })
    .slice(0, 5);

  for (const t of top5) {
    top5Vals.push(countyCrimeData[t.properties.name].violent);
    top5Names.push(t.properties.name);
  }

  const xscale = d3
    .scaleBand()
    .domain(top5Names.map((d) => d))
    .range([0, 260])
    .padding(0.3);

  const yscale = d3.scaleLinear().domain([0, 2300]).range([200, 0]);

  const x_axis = d3.axisBottom().scale(xscale);

  const y_axis = d3.axisLeft().scale(yscale);

  var xAxisTranslate = 210 / 2 + 95;

  let svg2 = d3
    .select('#vis-2')
    .append('svg')
    .attr('width', 290)
    .attr('height', 220)
    .attr('id', 'vis-2-svg')
    .append('g')
    .attr('transform', 'translate(35, 0)')
    .call(y_axis);

  svg2
    .append('g')
    .attr('transform', 'translate(0, ' + xAxisTranslate + ')')
    .call(x_axis);

  svg2
    .selectAll('rect')
    .data(top5)
    .enter()
    .append('rect')
    .attr('width', 30)
    .attr('height', function (data) {
      return countyCrimeData[data.properties.name].violent / 10;
    })
    .attr('x', function (data, i) {
      return 16 + i * (30 + 20);
    })
    .attr('y', function (data) {
      return 200 - countyCrimeData[data.properties.name].violent / 10;
    })
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
    });
}
