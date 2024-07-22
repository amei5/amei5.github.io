// Load the CSV file
d3.csv('constructor_standings.csv').then(function(data) {
    // Parse the data
    data.forEach(function(d) {
      d.year = +d.year; // Convert year to numeric
      d.position = +d.position; // Convert position to numeric
      d.points = +d.points; // Convert points to numeric
    });
  
    // Extract unique constructors from the data
    var constructors = [...new Set(data.map(d => d.constructor))].sort();  // nest function allows to group the calculation per level of a factor

    // Set up dimensions for the chart
    var margin = { top: 100, right: 200, bottom: 50, left: 60 },
    width = 1400 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

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

    var yPosition = d3.scaleLinear()
        .domain([d3.max(data, function(d) { return d.position; }), 1])
        .range([height, 0]);

    var yPoints = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.points; })])
        .range([height, 0])
        .nice();

    var color = d3.scaleOrdinal()
        .domain(constructors)
        .range(d3.schemeCategory10);

    var line = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return yPosition(d.position); });

    // Draw lines for each constructor
    var constructorLines = svg.selectAll(".constructor-line")
        .data(constructors)
        .enter().append("g")
        .attr("class", "constructor-line");

    const tooltip = d3.select('body').append('div')
        .attr("class", "tooltip");

    constructorLines.append("path")
        .attr("class", "line")
        .attr("d", function(c) {
            return line(data.filter(function(d) {
                return d.constructor === c;
            }));
        })
        .style("stroke", function(c) { return color(c); });

    // Add points for each data point
    constructorLines.selectAll(".point")
        .data(function(c) {
            return data.filter(function(d) {
                return d.constructor === c;
            });
        })
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return yPosition(d.position); })
        .attr("r", 6)
        .style("fill", function(d) { return color(d.constructor); })
        .on('mouseover', function (event, d) {
            tooltip.style("background", "rgba(69,77,93,.9)");
            tooltip.style("border-radius", ".2rem");
            tooltip.style("color", "#fff");
            tooltip.style("padding", ".6rem");
            tooltip.style("position", "absolute");
            tooltip.style("white-space", "pre");
            tooltip.style("line-height", "1em");
            tooltip.style("z-index", "300");
            tooltip.style('opacity', 1);
            tooltip.html(`<strong>Constructor:</strong> ${d.constructor} <br><strong>Year:</strong> ${d.year}<br><strong>Position:</strong> ${d.position}<br><strong>Points:</strong> ${d.points}`)
            .style('left', (event.pageX + 10) + "px")
            .style('top', (event.pageY - 28) + "px");
        })
        .on('mouseout', function (d) {
            tooltip.style('opacity', 0);
        });

    // Function to update y-axis based on dropdown selection
    function updateYAxis(selectedOption) {
    // Update y scale and line function based on selected option
        switch (selectedOption) {
            case 'position':
                yScale = yPosition;
                line.y(function(d) { return yPosition(d.position); });
                break;
            case 'points':
                yScale  = yPoints;
                line.y(function(d) { return yPoints(d.points); });
                break;
            default:
                yScale = yPosition;
                line.y(function(d) { return yPosition(d.position); });
                break;
        }

        // Update the y-axis
        svg.selectAll(".constructor-line")
            .select(".line")
            .transition()
            .duration(500)
            .attr("d", function(c) {
                return line(data.filter(function(d) {
                    return d.constructor === c;
                }));
            });

        // Update the points
        svg.selectAll(".point")
            .transition()
            .duration(500)
            .attr("cy", function(d) { 
                return yScale(selectedOption === 'position' ? d.position : d.points); 
            });
        
        // Update the y-axis label
        svg.select(".y-axis-label")
            .text(selectedOption === 'position' ? "Position" : "Points");

        // Update the y-axis
        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale));
    } 

    // Initial call to update y-axis
    updateYAxis('position');

    // Dropdown change handler
    d3.select("#y-axis-select")
        .on("change", function() {
            var selectedOption = d3.select(this).property("value");
            updateYAxis(selectedOption);
        });

    // Radio button change event listener
    d3.selectAll('input[name="values"]').on("change", function() {
        var selectedOption = this.value;
        updateYAxis(selectedOption);
     });

    // Add axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(24));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yPosition));

    // Add axis labels
    svg.append("text")
        .attr("class","y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Position");

    svg.append("text")
        .attr("class","x-axis-label")
        .attr("transform", "translate(" + (width/2 + 60) + " ," + (height + 50) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    let annotations = [
        {
            note: {label: "V10 Engine" },
            subject: {
                y1: margin.top - 20,
                y2: height + 100
            },
            y: 80,
            x: 60,
        },
        {
            note: {label: "V8 Engine" },
            subject: {
                y1: margin.top - 20,
                y2: height + 100
            },
            y: 80,
            x: 357,
        },
        {
            note: {label: "Hybrid V8 Engine" },
            subject: {
                y1: margin.top - 20,
                y2: height + 100
            },
            y: 80,
            x: 506,
        },
        {
            note: {label: "Hybrid V6 Turbo Engine" },
            subject: {
                y1: margin.top - 20,
                y2: height + 100
            },
            y: 80,
            x: 754,
        },
        ]

    // Add annotation to the chart
    const type = d3.annotationCustomType(
        d3.annotationXYThreshold, 
        {"note":{
            "lineType":"none",
            "orientation": "top",
            "align":"middle"}
        }
    )

    const makeAnnotations = d3.annotation()
        .type(type)
        .annotations(annotations)
        .textWrap(30)

    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .style("font-size", "14px")
        .style("stroke-dasharray", ("5, 5"))
        .call(makeAnnotations);

    // Add legend
    var legend = svg.selectAll(".legend")
        .data(constructors)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(150," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(c) { return color(c); });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("font-size", "14px")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
});