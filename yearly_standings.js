// Load the CSV file
d3.csv('race_details.csv').then(function(data) {
    // Parse the data
    data.forEach(function(d) {
        d.year = +d.year; // Convert year to numeric
        d.date = d.date;
        d.race = d.race_name.trim();
        d.position = +d.position; // Convert position to numeric
        d.points = +d.points; // Convert points to numeric
      });

    // Set initial year filter
    var currentYear = 2000;
    var selectedOption = 'position';

    // Function to filter data based on year
    function filterDataByYear(year) {
        return data.filter(function(d) {
            return d.year === year;
         });
    }

    function updateChart(year, selectedOption) {

        var filteredData = filterDataByYear(year);
        var constructors = [...new Set(filteredData.map(d => d.constructor))].sort();
    
        d3.select("#chart").selectAll("*").remove();

    // Set up dimensions for the chart
    var margin = { top: 50, right: 200, bottom: 120, left: 60 },
    width = 1400 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // Append SVG to the chart container
    var svg = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales and axes
    var x = d3.scaleBand()
        .domain(filteredData.map(d => d.race))
        .range([0, width]);

    var yPosition = d3.scaleLinear()
        .domain([d3.max(filteredData, function(d) { return d.position; }), 1])
        .range([height, 0]);

    var yPoints = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) { return d.points; })])
        .range([height, 0])
        .nice();

    var color = d3.scaleOrdinal()
        .domain(constructors)
        .range(d3.schemeCategory10);

    var line = d3.line()
        .x(function(d) { return x(d.race) + x.bandwidth() / 2; })
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
            return line(filteredData.filter(function(d) {
                return d.constructor === c;
            }));
        })
        .style("stroke", function(c) { return color(c); });

    // Add points for each data point
    constructorLines.selectAll(".point")
        .data(function(c) {
            return filteredData.filter(function(d) {
                return d.constructor === c;
            });
        })
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", function(d) { return x(d.race) + x.bandwidth() / 2; })
        .attr("cy", function(d) { return yPosition(d.position); })
        .attr("r", 6)
        .style("fill", function(d) { return color(d.constructor); })
        .on('mouseover', function (event, d) {
            tooltip.style('opacity', 1);
            tooltip.style("background", "rgba(69,77,93,.9)");
            tooltip.style("border-radius", ".2rem");
            tooltip.style("color", "#fff");
            tooltip.style("padding", ".6rem");
            tooltip.style("position", "absolute");
            tooltip.style("white-space", "pre");
            tooltip.style("line-height", "1em");
            tooltip.style("z-index", "300");
            tooltip.html(`<strong>Constructor:</strong> ${d.constructor} <br><strong>Race:</strong> ${d.race}<br><strong>Date:</strong> ${d.date}<br><strong>Position:</strong> ${d.position}<br><strong>Points:</strong> ${d.points}`)
            .style('left', (event.pageX + 10) + "px")
            .style('top', (event.pageY - 28) + "px");
        })
        .on('mouseout', function (d) {
            tooltip.style('opacity', 0);
        });

    // Add axis labels
    svg.append("text")
        .attr("class","y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Position");
    
    // x-axis
    svg.append("text")
        .attr("class","x-axis-label")
        .attr("transform", "translate(" + (width/2 + 70) + " ," + (height + 100) + ")")
        .style("text-anchor", "middle")
        .text("Grand Prix (Race)");

    // Add axes
    svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d => d))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("transform", "rotate(-45)")
    .style("font-size", "13px");
    
    svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yPosition));

    
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
                return line(filteredData.filter(function(d) {
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

    function updateInitialYAxis(selectedOption) { //without transitions
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
                .attr("d", function(c) {
                    return line(filteredData.filter(function(d) {
                        return d.constructor === c;
                    }));
                });
    
            // Update the points
            svg.selectAll(".point")
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
    updateInitialYAxis(selectedOption);

    //Event listener for radio buttons
    d3.selectAll('input[name="values"]').on("change", function() {
            var selectedOption = this.value;
            updateYAxis(selectedOption);
         });

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

    }

    // Slider change event listener
    d3.select("#year-slider").on("input", function() {
        var year = +d3.select(this).property("value");
        d3.select("#slider-value").text(year);
        currentYear = year;
        if (d3.select('input[name="values"]:checked').property("value") === 'points') {
            selectedOption = 'points';
        }
        else {selectedOption = 'position'}
        updateChart(currentYear, selectedOption);
    });

    //Load the initial year
    document.getElementById('sliderLabel').textContent = `Select Year:`;
    d3.select("#slider-value").text(currentYear);
    d3.select('input[name="values"][value="' + selectedOption + '"]').property("checked", true); // Set initial radio button selection
    updateChart(currentYear, selectedOption);
});