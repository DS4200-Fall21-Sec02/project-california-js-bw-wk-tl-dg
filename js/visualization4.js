// Immediately Invoked Function Expression to limit access to our
// variables and prevent

let countyData = {};

let currentView = 'temperature';

let currentColor = '#FFAE00';

const margin = { top: 20, right: 20, bottom: 70, left: 40 };

d3.csv('data/california_data_dump.csv').then(function (data) {
  for (let d of data) {
    countyData[d.County] = {
      crime: parseFloat(d.Violent.replaceAll(',', '')),
      population: parseInt(d.Population.replaceAll(',', '')),
      salary: parseFloat(
        d['Average Weekly Salary']
          .replaceAll(',', '')
          .replaceAll(' ', '')
          .replaceAll('$', '')
      ),
      temperature: parseFloat(d.Temperature.replaceAll(',', '')),
      rent: parseFloat(
        d['1 BR Rent ']
          .replaceAll(',', '')
          .replaceAll(' ', '')
          .replaceAll('$', '')
      ),
    };
  }
  console.log(countyData);
});

let countyNameData;

// The svg
const svg = d3.select('svg'),
  width = +svg.attr('width'),
  height = +svg.attr('height');

let svg2 = d3.select('svg');

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
    .style('stroke', 'black')
    .attr('fill', function (d) {
      if (currentView === 'rent') {
        return rentColor(d.properties.name);
      } else if (currentView === 'salary') {
        return salaryColor(d.properties.name);
      } else if (currentView === 'temperature') {
        return tempColor(d.properties.name);
      } else if (currentView === 'crime') {
        return crimeColor(d.properties.name);
      }
    })
    .attr('d', d3.geoPath().projection(projection))
    .attr('id', function (d) {
      return d.properties.name.replace(' ', '');
    });

  svg.call(
    d3
      .brush() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('end', updateOnBrushEnd)
  );

  countyNameData = data.features;
  findTopFive(currentView, countyNameData);
  changeKey();
  updateRange(tempRange);
});

function findTopFive(cat, data) {
  if (data.length < 5) {
    console.log('less than 5!');
  }
  if (document.getElementById('vis-2-svg')) {
    document.getElementById('vis-2-svg').remove();
  }
  let allVals = [];
  for (let d of data) {
    allVals.push(countyData[d.properties.name][currentView]);
  }
  const top5 = data
    .sort(function (a, b) {
      return (
        countyData[b.properties.name][currentView] -
        countyData[a.properties.name][currentView]
      );
    })
    .slice(0, 5);

  let top5Vals = [];
  let top5Names = [];

  for (const t of top5) {
    top5Vals.push(countyData[t.properties.name][currentView]);
    top5Names.push(t.properties.name);
  }

  const xscale = d3
    .scaleBand()
    .domain(top5Names.map((d) => d))
    .range([0, 255])
    .padding(0.3);

  const yscale = d3
    .scaleLinear()
    .domain([0, Math.max(...allVals)])
    .range([250, 10]);

  const x_axis = d3.axisBottom().scale(xscale);

  const y_axis = d3.axisLeft().scale(yscale);

  var xAxisTranslate = 180 / 2 + 160;

  let svg2 = d3
    .select('#vis-2')
    .append('svg')
    .attr('width', 300)
    .attr('height', 300)
    .attr('id', 'vis-2-svg')
    .append('g')
    .attr('transform', 'translate(35, 0)')
    .call(y_axis);

  svg2
    .append('g')
    .attr('transform', 'translate(0, ' + xAxisTranslate + ')')
    .call(x_axis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '.6em')
    .attr('dy', '.65em')
    .attr('transform', 'rotate(-35)');

  svg2
    .selectAll('rect')
    .data(top5)
    .enter()
    .append('rect')
    .attr('id', function (d) {
      return d.properties.name + ' Bar';
    })
    .attr('height', function (data) {
      return (
        (countyData[data.properties.name][currentView] / Math.max(...allVals)) *
        230
      );
    })
    .attr('y', function (data) {
      return (
        240 -
        (countyData[data.properties.name][currentView] / Math.max(...allVals)) *
          230
      );
    })
    .style('stroke', 'black')
    .attr('fill', function (d) {
      if (currentView === 'rent') {
        return rentColor(d.properties.name);
      } else if (currentView === 'salary') {
        return salaryColor(d.properties.name);
      } else if (currentView === 'temperature') {
        return tempColor(d.properties.name);
      } else if (currentView === 'crime') {
        return crimeColor(d.properties.name);
      }
    })
    .on('mouseover', function (d) {
      console.log(currentView);
      let county = this.id.replace(' Bar', '').replace(' ', '');
      let countyId = '#' + county;
      if (currentView === 'rent') {
        document.getElementById('tooltip').textContent =
          '$' + countyData[this.id.replace(' Bar', '')][currentView];
        d3.select(countyId).attr('fill', 'yellow');
      } else if (currentView === 'salary') {
        document.getElementById('tooltip').textContent =
          '$' + countyData[this.id.replace(' Bar', '')][currentView];
        d3.select(countyId).attr('fill', 'red');
      } else if (currentView === 'temperature') {
        document.getElementById('tooltip').textContent =
          countyData[this.id.replace(' Bar', '')][currentView] + '℉';
        d3.select(countyId).attr('fill', 'red');
      } else if (currentView === 'crime') {
        document.getElementById('tooltip').textContent =
          countyData[this.id.replace(' Bar', '')][currentView] + ' / year';
        d3.select(countyId).attr('fill', 'yellow');
      }
      document.getElementById('tooltip').style.display = 'block';
      document.getElementById('tooltip').style.left = d.pageX + 'px';
      document.getElementById('tooltip').style.top = d.pageY - 40 + 'px';
    })
    .on('mouseout', function () {
      document.getElementById('tooltip').style.display = 'none';
      let county = this.id.replace(' Bar', '');
      let countyConcat = county.replace(' ', '');
      let countyId = '#' + countyConcat;
      if (currentView === 'rent') {
        d3.select(countyId).attr('fill', rentColor(county));
      } else if (currentView === 'salary') {
        d3.select(countyId).attr('fill', salaryColor(county));
      } else if (currentView === 'temperature') {
        d3.select(countyId).attr('fill', tempColor(county));
      } else if (currentView === 'crime') {
        d3.select(countyId).attr('fill', crimeColor(county));
      }
    });

  if (data.length >= 5) {
    svg2
      .selectAll('rect')
      .attr('width', 48)
      .attr('x', function (data, i) {
        return i * 48 + 10;
      });
  } else {
    let dist = 240 / data.length;
    svg2
      .selectAll('rect')
      .attr('width', dist)
      .attr('x', function (d, i) {
        let v = 240 / data.length;
        return i * v + 10;
      });
  }
}

//Is called when we brush on scatterplot #1
function updateOnBrushEnd(brushEvent) {
  let rangeWithinDiv = brushEvent.selection;

  let parent = document.getElementById('vis-svg-1').getBoundingClientRect();
  let dataArr = [];
  d3.selectAll('path').each(function () {
    if (rangeWithinDiv) {
      let top = this.getBoundingClientRect().top - parent.top;
      let left = this.getBoundingClientRect().left - parent.left;
      let height = this.getBoundingClientRect().height;
      let width = this.getBoundingClientRect().width;
      let center = [left + width / 2, top + height / 2];
      if (
        center[0] >= rangeWithinDiv[0][0] &&
        center[0] <= rangeWithinDiv[0][1] &&
        center[1] >= rangeWithinDiv[0][1] &&
        center[1] <= rangeWithinDiv[1][1]
      ) {
        dataArr.push({
          properties: { name: this.id.replace(/([a-z])([A-Z])/g, '$1 $2') },
        });
        d3.select(this).style('opacity', '1');
      } else {
        d3.select(this).style('opacity', '0.2');
      }
    } else {
      d3.select(this).style('opacity', '1');
    }
  });
  if (dataArr.length > 0) {
    findTopFive(currentView, dataArr);
    if (dataArr.length > 5) {
      if (currentView === 'temperature') {
        document.getElementById('subTitle').textContent =
          'Top 5 Hottest Counties in Your Selection';
      } else if (currentView === 'salary') {
        document.getElementById('subTitle').textContent =
          'Top 5 Highest Earning Counties in Your Selection';
      } else if (currentView === 'rent') {
        document.getElementById('subTitle').textContent =
          'Top 5 Most Expensive Counties in Your Selection';
      } else if (currentView === 'crime') {
        document.getElementById('subTitle').textContent =
          'Top 5 Most Dangerous Counties in Your Selection';
      }
    } else if (dataArr.length === 1) {
      ('Viewing Data for 1 Selected County');
    } else {
      document.getElementById('subTitle').textContent =
        'Viewing Data for ' + dataArr.length + ' Selected Counties';
    }
  } else {
    d3.selectAll('path').style('opacity', '1');
    findTopFive(currentView, countyNameData);
    if (currentView === 'temperature') {
      document.getElementById('subTitle').textContent =
        'Top 5 Hottest Counties in California';
    } else if (currentView === 'salary') {
      document.getElementById('subTitle').textContent =
        'Top 5 Highest Earning Counties in California';
    } else if (currentView === 'rent') {
      document.getElementById('subTitle').textContent =
        'Top 5 Most Expensive Counties in California';
    } else if (currentView === 'crime') {
      document.getElementById('subTitle').textContent =
        'Top 5 Most Dangerous Counties in California';
    }
  }
}

const rentRange = ['<700', 800, 900, 1000, 1200, 1500, 1800, '2000+'];
const crimeRange = [0, 50, 100, 200, 300, 400, 500, '600+'];
const salaryRange = ['< 800', 900, 1000, 1100, 1300, 1800, 2200, '2900+'];
const tempRange = ['< 52', 54, 56, 58, 60, 62, 64, '66+'];

function changeDataView(event) {
  currentView = event.value;
  findTopFive(currentView, countyNameData);
  d3.selectAll('path').attr('fill', function (d) {
    if (d) {
      if (currentView === 'rent') {
        document.getElementById('rightTitle').textContent =
          'Average 1 BR Apartment Monthly Rent ($)';
        document.getElementById('subTitle').textContent =
          'Top 5 Most Expensive Counties in California';
        currentColor = '#1daee5';
        changeKey();
        updateRange(rentRange);
        return rentColor(d.properties.name);
      } else if (currentView === 'salary') {
        document.getElementById('rightTitle').textContent =
          'Average Weekly Take-Home Income ($)';
        document.getElementById('subTitle').textContent =
          'Top 5 Highest Earning Counties in California';
        currentColor = '#00FFAA';
        updateRange(salaryRange);
        changeKey();
        return salaryColor(d.properties.name);
      } else if (currentView === 'temperature') {
        document.getElementById('rightTitle').textContent =
          'Average Temperature (℉)';
        document.getElementById('subTitle').textContent =
          'Top 5 Hottest Counties in California';
        currentColor = '#FFAE00';
        updateRange(tempRange);
        changeKey();
        return tempColor(d.properties.name);
      } else if (currentView === 'crime') {
        document.getElementById('rightTitle').textContent =
          'Acts of Violent Crime';
        document.getElementById('subTitle').textContent =
          'Top 5 Most Dangerous Counties in California';
        currentColor = '#FF3536';
        changeKey();
        updateRange(crimeRange);
        return crimeColor(d.properties.name);
      }
    }
  });
}

function changeKey() {
  for (let i = 1; i < 10; i++) {
    if (i === 9) {
      document.getElementById(
        'b' + i.toString()
      ).style.backgroundColor = currentColor;
    } else {
      document.getElementById('b' + i.toString()).style.backgroundColor =
        currentColor + (i + 1).toString() + '0';
    }
  }
}

function updateRange(arr) {
  for (let i = 1; i < 9; i++) {
    document.getElementById('p' + i.toString()).textContent = arr[i - 1];
  }
}

function rentColor(countyName) {
  if (countyData[countyName].rent < 701) {
    return '#1daee510';
  } else if (
    countyData[countyName].rent > 700 &&
    countyData[countyName].rent < 801
  ) {
    return '#1daee520';
  } else if (
    countyData[countyName].rent > 800 &&
    countyData[countyName].rent < 901
  ) {
    return '#1daee530';
  } else if (
    countyData[countyName].rent > 900 &&
    countyData[countyName].rent < 1001
  ) {
    return '#1daee540';
  } else if (
    countyData[countyName].rent > 1000 &&
    countyData[countyName].rent < 1201
  ) {
    return '#1daee550';
  } else if (
    countyData[countyName].rent > 1200 &&
    countyData[countyName].rent < 1501
  ) {
    return '#1daee560';
  } else if (
    countyData[countyName].rent > 1500 &&
    countyData[countyName].rent < 1801
  ) {
    return '#1daee570';
  } else if (
    countyData[countyName].rent > 1800 &&
    countyData[countyName].rent < 2001
  ) {
    return '#1daee580';
  } else if (countyData[countyName].rent > 2000) {
    return '#1daee5';
  }
}

function salaryColor(countyName) {
  if (countyData[countyName].salary < 801) {
    return '#00FFAA10';
  } else if (
    countyData[countyName].salary > 800 &&
    countyData[countyName].salary < 901
  ) {
    return '#00FFAA20';
  } else if (
    countyData[countyName].salary > 900 &&
    countyData[countyName].salary < 1001
  ) {
    return '#00FFAA30';
  } else if (
    countyData[countyName].salary > 1000 &&
    countyData[countyName].salary < 1101
  ) {
    return '#00FFAA40';
  } else if (
    countyData[countyName].salary > 1100 &&
    countyData[countyName].salary < 1301
  ) {
    return '#00FFAA50';
  } else if (
    countyData[countyName].salary > 1300 &&
    countyData[countyName].salary < 1801
  ) {
    return '#00FFAA60';
  } else if (
    countyData[countyName].salary > 1800 &&
    countyData[countyName].salary < 2201
  ) {
    return '#00FFAA70';
  } else if (
    countyData[countyName].salary > 2200 &&
    countyData[countyName].salary < 2901
  ) {
    return '#00FFAA80';
  } else if (countyData[countyName].salary > 2900) {
    return '#00FFAA';
  }
}

function crimeColor(countyName) {
  if (countyData[countyName].crime <= 49) {
    return '#FF353610';
  } else if (
    countyData[countyName].crime > 49 &&
    countyData[countyName].crime <= 99
  ) {
    return '#FF353620';
  } else if (
    countyData[countyName].crime > 99 &&
    countyData[countyName].crime <= 149
  ) {
    return '#FF353630';
  } else if (
    countyData[countyName].crime > 149 &&
    countyData[countyName].crime <= 199
  ) {
    return '#FF353640';
  } else if (
    countyData[countyName].crime > 199 &&
    countyData[countyName].crime <= 299
  ) {
    return '#FF353650';
  } else if (
    countyData[countyName].crime > 299 &&
    countyData[countyName].crime <= 399
  ) {
    return '#FF353660';
  } else if (
    countyData[countyName].crime > 399 &&
    countyData[countyName].crime <= 499
  ) {
    return '#FF353670';
  } else if (
    countyData[countyName].crime > 499 &&
    countyData[countyName].crime <= 599
  ) {
    return '#FF353680';
  } else if (countyData[countyName].crime > 599) {
    return '#FF3536';
  }
}

function tempColor(countyName) {
  if (countyData[countyName].temperature <= 52) {
    return '#FFAE0020';
  } else if (
    countyData[countyName].temperature > 52 &&
    countyData[countyName].temperature <= 54
  ) {
    return '#FFAE0030';
  } else if (
    countyData[countyName].temperature > 54 &&
    countyData[countyName].temperature < 56
  ) {
    return '#FFAE0040';
  } else if (
    countyData[countyName].temperature > 54 &&
    countyData[countyName].temperature <= 58
  ) {
    return '#FFAE0050';
  } else if (
    countyData[countyName].temperature > 58 &&
    countyData[countyName].temperature <= 60
  ) {
    return '#FFAE0060';
  } else if (
    countyData[countyName].temperature > 60 &&
    countyData[countyName].temperature <= 62
  ) {
    return '#FFAE0070';
  } else if (
    countyData[countyName].temperature > 62 &&
    countyData[countyName].temperature <= 64
  ) {
    return '#FFAE0080';
  } else if (
    countyData[countyName].temperature > 64 &&
    countyData[countyName].temperature <= 66
  ) {
    return '#FFAE0090';
  } else if (countyData[countyName].temperature > 66) {
    return '#FFAE00';
  }
}
