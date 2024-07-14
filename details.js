// Load the CSV file
d3.csv('constructor_standings.csv').then(function(data) {
    // Parse the data
    data.forEach(function(d) {
      d.year = +d.year; // Convert year to numeric
      d.position = +d.position; // Convert position to numeric
    });
  
    // Extract unique constructors from the data
    var constructors = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.constructor;})
    .entries(data);
  
    // Set up dimensions for the chart
  var margin = { top: 20, right: 30, bottom: 30, left: 60 },
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Append SVG to the chart container
var svg = d3.select("#chart")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define scales and axes
var x = d3.scaleLinear()
.domain(d3.extent(data, function(d) { return d.year; }))
.range([0, width]);

var y = d3.scaleLinear()
.domain([1, d3.max(data, function(d) { return d.position; })])
.range([height, 0]);

var color = d3.scaleOrdinal()
.domain(constructors)
.range(d3.schemeCategory10);

// Define line generator
var line = d3.line()
.x(function(d) { return x(d.year); })
.y(function(d) { return y(d.position); });

// Draw lines for each constructor
svg.selectAll(".line")
.data(constructors)
.enter()
.append("path")
    .attr("fill", "none")
    .attr("stroke", function(d){ return color(d.key) })
    .attr("stroke-width", 2)
    .attr("d", function(c) {
        return d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.position); })
        })

// Add points for each data point
//svg.selectAll(".point")
//.data(function(c) {
 // return data.filter(function(d) {
 //   return d.constructor === c;
 // });
//})
//.enter().append("circle")
//.attr("class", "point")
//.attr("cx", function(d) { return x(d.year); })
//.attr("cy", function(d) { return y(d.position); })
//.attr("r", 4)
//.style("fill", function(d) { return color(d.constructor); });

// Add axes
svg.append("g")
.attr("class", "x-axis")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x).tickFormat(d3.format("d")));

svg.append("g")
.attr("class", "y-axis")
.call(d3.axisLeft(y));

// Add axis labels
svg.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.style("text-anchor", "middle")
.text("Position");

svg.append("text")
.attr("transform",
      "translate(" + (width/2) + " ," +
                     (height + margin.top + 10) + ")")
.style("text-anchor", "middle")
.text("Year");

// Add legend
var legend = svg.selectAll(".legend")
.data(constructors)
.enter().append("g")
.attr("class", "legend")
.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
.attr("x", width - 18)
.attr("width", 18)
.attr("height", 18)
.style("fill", function(c) { return color(c); });

legend.append("text")
.attr("x", width - 24)
.attr("y", 9)
.attr("dy", ".35em")
.style("text-anchor", "end")
.text(function(d) { return d; });
});