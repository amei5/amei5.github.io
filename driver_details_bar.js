// Load the CSV file
d3.csv('driver_details.csv').then(function(data) {

    // Parse the data
    data.forEach(function(d) {
        d.year = +d.year; // Convert year to numeric
        d.date = d.date;
        d.race = d.race_name.trim();
        d.firstname = d.firstname.trim();
        d.lastname = d.lastname.trim();
        d.position = +d.position; // Convert position to numeric
        d.points = +d.points; // Convert points to numeric
        d.totalpoints = +d.cumulative_points
      });
      
    // Extract unique constructors from the data
    var constructors = [...new Set(data.map(d => d.constructor))].sort();
    //var years = [...new Set(data.map(d => d.year))].sort().reverse(); //Descending order

    // Populate the dropdowns with options
    var constructorDropdown = d3.select("#constructor-select");
    constructorDropdown.selectAll("option")
        .data(constructors)
        .enter().append("option")
        .text(function(d) { return d; });
    
    // Set initial selections
    var selectedConstructor = constructors[0]; // Default to first constructor
    var selectedYear = 2000; // Default to most recent year
    var selectedOption = 'totalpoints'
    
    // Function to filter data based on constructor and year
    function filterData(selectedConstructor, selectedYear) {
        return data.filter(function(d) {
            return d.constructor === selectedConstructor && d.year === selectedYear;
        });
    }

    // Function to update chart based on selected constructor and year
    function updateChart(selectedConstructor, selectedYear, selectedOption) {
        // Filter data based on selected constructor and year
        var filteredData = filterData(selectedConstructor, selectedYear);
    
        // Remove existing chart elements
        d3.select("#chart").selectAll("*").remove();
    

    // Extract unique races
    var races = [...new Set(filteredData.map(d => d.race))];
    var drivers = [...new Set(filteredData.map(d => d.lastname))].sort();  // nest function allows to group the calculation per level of a factor

    // Set up dimensions for the chart
    var margin = { top: 100, right: 200, bottom: 110, left: 60 },
        width = 1400 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Append SVG to the chart container
    var svg = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales and axes
    var x0 = d3.scaleBand()
        .domain(races)
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .domain(drivers)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.totalpoints)])
        .range([height, 0])
        .nice();

    var color = d3.scaleOrdinal()
        .domain(drivers)
        .range(d3.schemeCategory10);

    // Update y-axis function for transition
    var yAxis = svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // Add bars for each driver
    var bars = svg.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x0(d.race) + ",0)"; })
        .attr("x", function(d) { return x1(d.lastname); })
        .attr("y", function(d) { return yScale(d.totalpoints); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - yScale(d.totalpoints); })
        .style("fill", function(d) { return color(d.lastname); })
        .on('mouseover', function(event, d) {
            tooltip.style('opacity', 1);
            tooltip.html(`<strong>First Name:</strong> ${d.firstname} <br><strong>Last Name:</strong> ${d.lastname}<br><strong>Race:</strong> ${d.race}<br><strong>Date:</strong> ${d.date}<br><strong>Total Points:</strong> ${d.totalpoints}<br><strong>Points:</strong> ${d.points}`)
                .style('left', (event.pageX + 10) + "px")
                .style('top', (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
            tooltip.style('opacity', 0);
        });

    // Function to update y-axis based on dropdown selection
    function updateYAxis(selectedOption) {
        switch (selectedOption) {
            case 'totalpoints':
                yScale.domain([0, d3.max(filteredData, d => d.totalpoints)]);
                break;
            case 'points':
                yScale.domain([0, d3.max(filteredData, d => d.points)]);
                break;
            default:
                yScale.domain([0, d3.max(filteredData, d => d.totalpoints)]);
                break;
        }

        // Update the y-axis
        yAxis.transition()
            .duration(500)
            .call(d3.axisLeft(yScale));

        // Update the bars
        bars.transition()
            .duration(500)
            .attr("y", function(d) { return yScale(selectedOption === 'totalpoints' ? d.totalpoints : d.points); })
            .attr("height", function(d) { return height - yScale(selectedOption === 'totalpoints' ? d.totalpoints : d.points); });

        // Update the y-axis label
        svg.select(".y-axis-label")
            .text(selectedOption === 'totalpoints' ? "Total Points" : "Points");
    }

    // Initial Function to update y-axis based on dropdown selection w/out transition
    function updateInitialYAxis(selectedOption) {
        switch (selectedOption) {
            case 'totalpoints':
                yScale.domain([0, d3.max(filteredData, d => d.totalpoints)]);
                break;
            case 'points':
                yScale.domain([0, d3.max(filteredData, d => d.points)]);
                break;
            default:
                yScale.domain([0, d3.max(filteredData, d => d.totalpoints)]);
                break;
        }

        // Update the y-axis
        yAxis.call(d3.axisLeft(yScale));

        // Update the bars
        bars
            .attr("y", function(d) { return yScale(selectedOption === 'totalpoints' ? d.totalpoints : d.points); })
            .attr("height", function(d) { return height - yScale(selectedOption === 'totalpoints' ? d.totalpoints : d.points); });

        // Update the y-axis label
        svg.select(".y-axis-label")
            .text(selectedOption === 'totalpoints' ? "Total Points" : "Points");
    }

    //Initial update
    updateInitialYAxis(selectedOption);

    // Radio button change event listener
    d3.selectAll('input[name="values"]').on("change", function() {
        var selectedOption = this.value;
        updateYAxis(selectedOption);
     });

    // Add y-axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Points");

    // Add x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .style("font-size", "13px");
    
    // x-axis label
    svg.append("text")
    .attr("class","x-axis-label")
    .attr("transform", "translate(" + (width/2 + 70) + " ," + (height + 90) + ")")
    .style("text-anchor", "middle")
    .text("Grand Prix (Race)");

    // Add legend
    var legend = svg.selectAll(".legend")
        .data(drivers)
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
        .style("font-size","14px")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    // Tooltip div element
    const tooltip = d3.select('body').append('div')
        .attr("class", "tooltip")
        .style("background", "rgba(69,77,93,.9)")
        .style("border-radius", ".2rem")
        .style("color", "#fff")
        .style("padding", ".6rem")
        .style("position", "absolute")
        .style("text-overflow", "ellipsis")
        .style("white-space", "pre")
        .style("line-height", "1em")
        .style("z-index", "300");
    }

    //Initial update
    document.getElementById('sliderLabel').textContent = `Select Year:`;
    d3.select("#slider-value").text(selectedYear);
    d3.select('input[name="values"][value="' + selectedOption + '"]').property("checked", true); // Set initial radio button selection
    updateChart(selectedConstructor, selectedYear, selectedOption);
    
    // Event listener for constructor selection
    constructorDropdown.on("change", function() {
        selectedConstructor = d3.select(this).property("value");
        if (d3.select('input[name="values"]:checked').property("value") === 'points') {
            selectedOption = 'points';
        }
        else {selectedOption = 'totalpoints'}
        updateChart(selectedConstructor, selectedYear, selectedOption);
    });

    // Slider change event listener
    d3.select("#year-slider").on("input", function() {
        var year = +d3.select(this).property("value");
        d3.select("#slider-value").text(year);
        selectedYear = year;
        if (d3.select('input[name="values"]:checked').property("value") === 'points') {
            selectedOption = 'points';
        }else {selectedOption = 'totalpoints'}
        updateChart(selectedConstructor, selectedYear, selectedOption);
    });

});