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
    .attr("width", "100%") // Set width to 100% for responsiveness
    .attr("height", "100%") // Set height to 100% for responsiveness
    .attr("preserveAspectRatio", "xMidYMid meet") // Preserve aspect ratio
    .attr("viewBox", `0 0 ${width} ${height}`) // Define viewBox for scaling
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Extract the data from the object into an array of { language: name, count: value }
  var data = Object.keys(languages).map((key) => ({
    language: key,
    count: languages[key],
  }));

  // Calculate total count of all languages
  var total = d3.sum(data, (d) => d.count);

  // Filter out languages that make up less than 5% of the total
  var filteredData = data.filter((d) => (d.count / total) >= 0.05);

  // Sum up counts of languages that make up less than 5% and group into "Other"
  var otherCount = d3.sum(data, (d) => (d.count / total) < 0.05 ? d.count : 0);
  if (otherCount > 0) {
    filteredData.push({ language: "Other", count: otherCount });
  }

  // Sort data by count descending
  filteredData.sort((a, b) => b.count - a.count);

  // Define color scale
  var customRange = d3.schemeCategory10; // Using a predefined D3 color scheme
  var color = d3.scaleOrdinal()
    .domain(filteredData.map((d) => d.language))
    .range(customRange);

  // Compute the position of each group on the pie:
  var pie = d3.pie().value((d) => d.count);

  var data_ready = pie(filteredData);

  // Define the arc generator
  var arc = d3.arc().innerRadius(0).outerRadius(radius);

  // Build the pie chart
  var arcs = svg.selectAll("pieces")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.language))
    .attr("stroke", "black")
    .style("stroke-width", "2px");

  // Add labels with percentages
  var labels = svg.selectAll("labels")
    .data(data_ready)
    .enter()
    .append("text")
    .text(function(d) {
      // Calculate percentage and format label
      var percentage = ((d.data.count / total) * 100).toFixed(1);
      return `${d.data.language} (${percentage}%)`;
    })
    .attr("transform", function(d) {
      var pos = arc.centroid(d);
      var midAngle = Math.atan2(pos[1], pos[0]);
      var x = Math.cos(midAngle) * (radius + 50);
      var y = Math.sin(midAngle) * (radius + 50);
      return `translate(${x},${y})`;
    })
    .style("text-anchor", function(d) {
      var pos = arc.centroid(d);
      return Math.cos(Math.atan2(pos[1], pos[0])) > 0 ? "start" : "end";
    })
    .style("font-size", 16)
    .attr("fill", "white");

  // Function to check and adjust label positions
  function adjustLabelPositions() {
    var labelNodes = labels.nodes();
    var labelBoxes = labelNodes.map(function(labelNode) {
      return labelNode.getBBox();
    });

    for (var i = 0; i < labelBoxes.length; i++) {
      for (var j = i + 1; j < labelBoxes.length; j++) {
        if (isOverlapping(labelBoxes[i], labelBoxes[j])) {
          var newY = labelBoxes[j].y + labelBoxes[j].height + 100; // Adjust vertical spacing
          d3.select(labelNodes[j]).attr("transform", `translate(${labelBoxes[j].x},${newY})`);
          labelBoxes[j].y = newY;
        }
      }
    }
  }

  // Helper function to check if two bounding boxes overlap
  function isOverlapping(box1, box2) {
    return !(box1.x + box1.width < box2.x ||
             box2.x + box2.width < box1.x ||
             box1.y + box1.height < box2.y ||
             box2.y + box2.height < box1.y);
  }

  // Call adjustLabelPositions initially and after a delay to allow rendering
  setTimeout(adjustLabelPositions, 10); // Adjust timing as needed based on rendering speed

  // End of function
}



async function createTopTenContributorsChart() {
  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 20, bottom: 150, left: 90 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
  d3.select("svg").remove();
  var svgContainer = d3.select("#chart-0-container");

  // Adjusted width and height to fit within the container
  var svgWidth = width + margin.left + margin.right;
  var svgHeight = height + margin.top + margin.bottom;
  
  // Append a new SVG for #chart-1
  var svg = svgContainer
    .append("svg")
    .attr("id", "chart-1")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const data = await responseData.getTopTenContributors(owner, repo);

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
    .style("text-anchor", "end")
    .style("font-size", 24);

  let maxContributions = d3.max(
    data.map(function (d) {
      return d.contributions;
    }),
  );
  // Add Y axis
  var y = d3.scaleLinear().domain([0, maxContributions]).range([height, 0]);

  svg.append("g").call(d3.axisLeft(y)).style("font-size", 24);;

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
    .attr("fill", "palegreen");
}

//end top ten contributors function

async function createStargazersAndForksChart() {
  // Fetch stargazers and forks data asynchronously
  const response = await responseData.getStargazersAndForks(owner, repo);

  // Remove any existing SVG to start fresh
  d3.select("svg").remove();

  // Set the dimensions and margins of the graph
  var margin = { top: 20, right: 20, bottom: 150, left: 90 },
      width = 500 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // Adjusted width and height to fit within the container
  var svgWidth = width + margin.left + margin.right;
  var svgHeight = height + margin.top + margin.bottom;
  
  // Select the container for the chart
  var svgContainer = d3.select("#chart-0-container");

  // Append a new SVG for the chart
  var svg = svgContainer
    .append("svg")
    .attr("id", "chart-2")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Construct data array from the response
  let data = [
    { label: "Stargazers", value: response.stargazers_count },
    { label: "Forks", value: response.forks_count }
  ];

  // X axis
  var x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(d => d.label))
    .padding(0.2);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", 16);

  // Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y))
    .style("font-size", 16);

  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", "lightblue");

  // Optional: Add chart title or other annotations

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

  var svgContainer = d3.select("#chart-0-container");

  var svg = svgContainer
    .append("svg")
    .attr("width", 800) // Set a width for the SVG container
    .attr("height", 200); // Set a height for the SVG container

  // Append a group ('g') element to the SVG
  var g = svg.append("g");

  // Append text element to the group ('g')
  g.append("text")
    .attr("x", 50) // Adjust x position as needed
    .attr("y", 50) // Adjust y position as needed
    .text(
        duration.years + " years, " +
        duration.months + " months, " +
        duration.days + " days"
    ).attr("fill", "white").style("font-size", 60); 
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
