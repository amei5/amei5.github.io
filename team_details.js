d3.csv('race_details.csv').then(function(data) {
    // Parse the data
    data.forEach(function(d) {
      d.year = +d.year; // Convert year to numeric
      d.date = d.date;
      d.race = d.race_name;
      d.position = +d.position; // Convert position to numeric
      d.points = +d.points; // Convert points to numeric
    });

    // Extract unique constructors from the data
    var constructors = [...new Set(data.map(d => d.constructor))].sort();  // nest function allows to group the calculation per level of a factor

    data = data.filter(
        d => d.constructor === "Ferrari" && d.year === 2000
    );
  
    var margin = { top: 30, right: 200, bottom: 30, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

    var svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up the dimensions for the table
    const svgWidth = +svg.attr("width");
    const svgHeight = +svg.attr("height");
    const tableHeight = svgHeight * 0.75;
    const barHeight = svgHeight * 0.1;
    const barWidth = svgWidth * 0.9;
    const tableWidth = svgWidth * 0.9;

    // Select the container element for the table
    const tableContainer = svg.append("foreignObject")
    .attr("x", 100)
    .attr("y", 10)
    .attr("width", 800)
    .attr("height", 800)
    .append("xhtml:div")
    .style("overflow", "auto")
    .style("max-height", `${tableHeight - 50}px`) // Adjust the max-height to be slightly smaller
    .style("padding", "20px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px");

    // Create the HTML table
    const table = tableContainer.append("table")
    .style("width", "100%")
    .style("border-collapse", "collapse");

    // Create the table header
    const thead = table.append("thead");
    const headerRow = thead.append("tr")
    .style("background-color", "#f0f0f0")
    .style("font-weight", "bold");
    headerRow.append("th").text("Date");
    headerRow.append("th").text("Race");
    headerRow.append("th").text("Position");
    headerRow.append("th").text("Cumulative Points");

    // Create the table body
    const tbody = table.append("tbody");

    const barContainer = svg.append("g")
    .attr("transform", `translate(${(svgWidth - barWidth) / 2}, ${(svgHeight + tableHeight) / 2 - 30})`);

    const barBackground = barContainer.append("rect")
    .attr("width", barWidth)
    .attr("height", barHeight)
    .style("fill", "#e0e6ed") 
    .style("stroke", "#ddd")
    .style("stroke-width", "1px")
    .style("rx", "4px")
    .style("ry", "4px");

    const barFill = barContainer.append("rect")
    .attr("width", 0)
    .attr("height", barHeight)
    .style("fill", "steelblue")
    .style("rx", "4px")
    .style("ry", "4px");

    const barText = barContainer.append("text")
    .attr("x", barWidth / 2)
    .attr("y", barHeight / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("fill", "black")
    .style("font-weight", "bold");

    const rows = tbody.selectAll("tr").data(data);
    const enterRows = rows.enter().append("tr");
    const formatComma = d3.format(",");
    const formatCurrency = d3.format(",");

    enterRows.append("td")
    .style("padding", "8px")
    .style("border-bottom", "1px solid #ddd")
    .text(d => d.date);

    enterRows.append("td")
    .style("padding", "8px")
    .style("border-bottom", "1px solid #ddd")
    .text(d => d.race);

    enterRows.append("td")
    .style("padding", "8px")
    .style("border-bottom", "1px solid #ddd")
    .text(d => formatComma(d.position));

    enterRows.append("td")
    .style("padding", "8px")
    .style("border-bottom", "1px solid #ddd")
    .text(d => formatCurrency(d.points));
});