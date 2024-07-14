const w = 800;
const h = 500;
const padding = 100;
const labelPadding = 200;

let svg = d3.select('body')
  .append('svg')
  .style('display', 'block')
  .style('margin', 'auto')
  .attr('width', w + labelPadding)
  .attr('height', h)
  .attr("viewBox", `-150 0 ${w + labelPadding + 150} ${h}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('position', 'absolute')
  .style('opacity', 0)
  .style('z-index', '10');

let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

//Load Data
d3.csv('constructor_standings.csv').then(function(data) {
    const constructors = data.map(function(d) {
        return d.constructor;
      });

  // Get unique genres from your data and create dropdown
  //const constructors = ["All Constructors", ...new Set(filteredData.map(item => item.constructor))].sort();
  // const genres = Array.from(new Set(data.map(d => d.Genre))).sort();

  var dropdown = d3.select("#constructorSelect");

  dropdown.selectAll('option')
  .data(constructors)
  .enter()
  .append('option')
  .text(function(d) { return d; })
  .attr('value', function(d) { return d; });

   // constructors.forEach(function (constructor) {
  //  dropdown.append("option").text(constructor).attr("value", constructor);
  //});
});