async function createLanguageChart() {
  const languages = await responseData.getLanguages(owner, repo);
  d3.select("svg").remove();

  // Set the dimensions and margins of the graph
  var width = 600; // Adjusted for better visibility
  var height = 600; // Adjusted for better visibility
  var margin = 100;

  // The radius of the pieplot is half the width or height (whichever is smaller)
  var radius = Math.min(width, height) / 2 - margin;

  // Append the svg object to the div called 'chart-0-container'
  const svg = d3
    .select("#chart-0-container")
    .append("svg")
    .attr("id", "chart-0")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Extract the data from the object into an array of { language: name, count: value }
  var data = Object.keys(languages).map(key => ({
    language: key,
    count: languages[key]
  }));

  // Sort data by count descending
  data.sort((a, b) => b.count - a.count);

  // Define color scale
  var customRange = d3.schemeCategory10; // Using a predefined D3 color scheme
  var color = d3.scaleOrdinal()
    .domain(data.map(d => d.language))
    .range(customRange);

  // Compute the position of each group on the pie:
  var pie = d3.pie()
    .value(d => d.count);

  var data_ready = pie(data);

  // Define the arc generator
  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // Build the pie chart
  var arcs = svg.selectAll("pieces")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.language))
    .attr("stroke", "black")
    .style("stroke-width", "2px");

  // Add lines
  svg.selectAll('lines')
    .data(data_ready)
    .enter()
    .append('line')
    .attr('x1', d => arc.centroid(d)[0])
    .attr('y1', d => arc.centroid(d)[1])
    .attr('x2', function(d) {
      var pos = arc.centroid(d);
      var midAngle = Math.atan2(pos[1], pos[0]);
      var x = Math.cos(midAngle) * (radius + 30);
      return x;
    })
    .attr('y2', function(d) {
      var pos = arc.centroid(d);
      var midAngle = Math.atan2(pos[1], pos[0]);
      var y = Math.sin(midAngle) * (radius + 30);
      return y;
    })
    .attr('stroke', 'white');

  // Add labels with adjustments for overlap prevention
  var labelPositions = [];
  var overlappingLabels = [];

  svg.selectAll('labels')
    .data(data_ready)
    .enter()
    .append('text')
    .text(d => d.data.language)
    .attr('transform', function(d, i) {
      var pos = arc.centroid(d);
      var midAngle = Math.atan2(pos[1], pos[0]);
      var x = Math.cos(midAngle) * (radius + 50); // Initial label position
      var y = Math.sin(midAngle) * (radius + 50); // Initial label position
      
      // Check for overlap with previous labels
      var lineHeight = 20; // Minimum line height
      var overlapping = true;
      var j = 0;
      while (overlapping && j < labelPositions.length) {
        var prevPos = labelPositions[j];
        var dx = x - prevPos.x;
        var dy = y - prevPos.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < lineHeight) { // If labels are too close, add to overlapping list
          overlappingLabels.push(d.data.language);
          overlapping = false; // Stop checking for this label
        }
        j++;
      }
      
      // Store label position
      labelPositions.push({ x: x, y: y });
      
      return 'translate(' + x + ',' + y + ')';
    })
    .style('text-anchor', function(d) {
      var pos = arc.centroid(d);
      return (Math.cos(Math.atan2(pos[1], pos[0])) > 0) ? 'start' : 'end';
    })
    .style("font-size", 14) // Adjust font size as needed
    .attr("fill", "white");

  // Display overlapping labels in a separate list
  if (overlappingLabels.length > 0) {
    var listMargin = 10;
    var listX = width - margin + listMargin;
    var listY = margin;
    var listItemHeight = 20;

    // Append list title
    svg.append('text')
      .text('Overlapping Labels:')
      .attr('x', listX)
      .attr('y', listY)
      .attr('fill', 'white')
      .style('font-weight', 'bold');

    // Append list items
    svg.selectAll('listItems')
      .data(overlappingLabels)
      .enter()
      .append('text')
      .text((d, i) => `${i + 1}. ${d}`)
      .attr('x', listX)
      .attr('y', (d, i) => listY + (i + 1) * listItemHeight)
      .attr('fill', 'white');
  }

  // End of function
}



async function createTopTenContributorsChart() {
  // set the dimensions and margins of the graph
  var margin = { top: 30, right: 30, bottom: 70, left: 30 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
  d3.select("svg").remove();
  // Select the container where you want to append #chart-1
  var svgContainer = d3.select("#chart-0-container");

  // Append a new SVG for #chart-1
  var svg = svgContainer
    .append("svg")
    .attr("id", "chart-1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  const data = await responseData.getTopTenContributors(owner, repo);
  console.log(data);

  // append the svg object to the body of the page

  // Parse the Data
  console.log(
    data.map(function (d) {
      return d.login;
    }),
  );
  // X axis
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(
      data.map(function (d) {
        return d.login;
      }),
    )
    .padding(0.2);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  let maxContributions = d3.max(
    data.map(function (d) {
      return d.contributions;
    }),
  );
  // Add Y axis
  var y = d3.scaleLinear().domain([0, maxContributions]).range([height, 0]);

  svg.append("g").call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.login);
    })
    .attr("y", function (d) {
      return y(d.contributions);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return height - y(d.contributions);
    })
    .attr("fill", "#69b3a2");
}

//end top ten contributors function
async function createStargazersAndForksChart() {
  var margin = { top: 30, right: 30, bottom: 70, left: 30 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const response = await responseData.getStargazersAndForks(owner, repo);

  d3.select("svg").remove();

  var svgContainer = d3.select("#chart-0-container");

  let data = [response.stargazers_count, response.forks_count];

  let min = d3.min(data);
  let max = d3.max(data);
  let scale = d3.scaleSqrt().domain([min, max]).range([10, 20]);

  let svg = svgContainer
    .append("svg")
    .selectAll("g")
    .attr("id", "chart-2")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .data(data)
    .enter()
    .append("g")
    .attr("transform", (d, i) => "translate(" + (i * 200 + 50) + ", 50)");

  svg.append("circle").attr("r", scale).attr("fill", "#ccc");

  svg
    .append("text")
    .text(
      (d) =>
        d + " " + (d === response.stargazers_count ? "Stargazers" : "Forks"),
    )
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("dy", -20)
    .attr("fill", "white");
  console.log(data);
}
async function createLengthActiveChart() {
  d3.select("svg").remove();
  const data = await responseData.getLengthActive(owner, repo);

  function calculateDuration(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const diffMonths = dateFns.differenceInCalendarMonths(endDate, startDate);
    const diffDays = dateFns.differenceInCalendarDays(endDate, startDate);

    // Calculate years and remaining months
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    return { years, months, days: diffDays };
  }

  // Example usage:
  const startDateStr = data.created_at;
  const endDateStr = data.pushed_at;

  const duration = calculateDuration(startDateStr, endDateStr);
  console.log("DURATION", duration);

  console.log("LENGTH ACTIVE", data);
  var svgContainer = d3.select("#chart-0-container");

  var svg = svgContainer
    .append("svg")
    .attr("width", 400) // Set a width for the SVG container
    .attr("height", 200); // Set a height for the SVG container

  // Append a group ('g') element to the SVG
  var g = svg.append("g");

  // Append text element to the group ('g')
  g.append("text")
    .attr("x", 50) // Adjust x position as needed
    .attr("y", 50) // Adjust y position as needed
    .text(
        duration.years + " years ",
        duration.months + "months ",
        duration.days + " days"
    ).attr("fill", "white"); 
}

async function createSizeChart() {
  const data = await responseData.getSize(owner, repo);
  d3.select("svg").remove();
  console.log(data);
  var svgContainer = d3.select("#chart-0-container");
  var svg = svgContainer
    .append("svg")
    .attr("width", 600) // Set a width for the SVG container
    .attr("height", 400); // Set a height for the SVG container


// Define the dimensions and position of the text box
var boxWidth = 300;
var boxHeight = 200;
var boxX = 50;
var boxY = 50;
var borderRadius = 10; // Optional: if you want rounded corners

// Create a rectangle for the background
var rect = svg.append("rect")
  .attr("x", boxX)
  .attr("y", boxY)
  .attr("width", boxWidth)
  .attr("height", boxHeight)
  .attr("rx", borderRadius) // Rounded corners
  .attr("ry", borderRadius)
  .style("fill", "lightblue")
  .style("stroke", "white")
  .style("stroke-width", 2);

// Add text inside the box
var text = svg.append("text")
  .attr("x", boxX + boxWidth / 2)
  .attr("y", boxY + boxHeight / 2)
  .style("font-size", "30px")
  .style("fill", "white")
  .text(data.toString() + " KB");


// Adjust the position of the text relative to the box
var textBBox = text.node().getBBox();
var textWidth = textBBox.width;
var textHeight = textBBox.height;

// Center the text vertically and horizontally
text.attr("x", boxX + boxWidth / 2 - textWidth / 2)
    .attr("y", boxY + boxHeight / 2 - textHeight / 2);
}
