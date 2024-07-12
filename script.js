// Example D3 code to create a simple SVG circle
const svg = d3.select("#viz")  // Selects the <div> with id="viz"
    .append("svg")              // Appends an <svg> element to the <div>
    .attr("width", 400)         // Sets the width of the SVG canvas
    .attr("height", 200);       // Sets the height of the SVG canvas

svg.append("circle")            // Appends a <circle> element to the SVG
    .attr("cx", 200)            // Sets the x-coordinate of the center of the circle
    .attr("cy", 100)            // Sets the y-coordinate of the center of the circle
    .attr("r", 50)              // Sets the radius of the circle
    .style("fill", "blue");     // Sets the fill color of the circle