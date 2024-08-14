async function createLanguageChart(languages) {
  d3.select("svg").remove();

  var width = 900;
  var height = 600;
  var margin = 100;

  var radius = Math.min(width, height) / 2 - margin;

  const svg = d3
    .select("#chart-0-container")
    .append("svg")
    .attr("id", "chart-0")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  var data = Object.keys(languages).map((key) => ({
    language: key,
    count: languages[key],
  }));

  var total = d3.sum(data, (d) => d.count);

  var filteredData = data.filter((d) => d.count / total >= 0.05);

  // Sum up counts of languages that make up less than 5% and group into "Other"
  var otherCount = d3.sum(data, (d) => (d.count / total < 0.05 ? d.count : 0));
  if (otherCount > 0) {
    filteredData.push({ language: "Other", count: otherCount });
  }

  filteredData.sort((a, b) => b.count - a.count);

  var customRange = d3.schemeCategory10; // Using a predefined D3 color scheme
  var color = d3.scaleOrdinal().domain(filteredData.map((d) => d.language)).range(customRange);

  var pie = d3.pie().value((d) => d.count);

  var data_ready = pie(filteredData);

  var arc = d3.arc().innerRadius(0).outerRadius(radius);

  var arcs = svg
    .selectAll("pieces")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.language))
    .attr("stroke", "black")
    .style("stroke-width", "2px");

  var labels = svg
    .selectAll("labels")
    .data(data_ready)
    .enter()
    .append("text")
    .text(function (d) {
      var percentage = ((d.data.count / total) * 100).toFixed(1);
      return `${d.data.language} (${percentage}%)`;
    })
    .attr("transform", function (d) {
      var pos = arc.centroid(d);
      var midAngle = Math.atan2(pos[1], pos[0]);
      var x = Math.cos(midAngle) * (radius + 50);
      var y = Math.sin(midAngle) * (radius + 50);
      return `translate(${x},${y})`;
    })
    .style("text-anchor", function (d) {
      var pos = arc.centroid(d);
      return Math.cos(Math.atan2(pos[1], pos[0])) > 0 ? "start" : "end";
    })
    .style("font-size", 24)
    .attr("fill", "white");

  // Apply force-directed placement to labels to avoid overlap
  function forceDirectedLabelPlacement() {
    var nodes = labels.nodes().map((label, i) => {
      var bbox = label.getBBox();
      return {
        node: label,
        x: parseFloat(label.getAttribute('transform').split('(')[1].split(')')[0].split(',')[0]),
        y: parseFloat(label.getAttribute('transform').split('(')[1].split(')')[0].split(',')[1]),
        width: bbox.width,
        height: bbox.height,
        originalX: parseFloat(label.getAttribute('transform').split('(')[1].split(')')[0].split(',')[0]),
        originalY: parseFloat(label.getAttribute('transform').split('(')[1].split(')')[0].split(',')[1])
      };
    });

    // Simple force simulation
    for (var i = 0; i < 500; i++) { // Iterate more for better results
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[b].x - nodes[a].x;
          var dy = nodes[b].y - nodes[a].y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          var minDist = (nodes[a].width + nodes[b].width) / 2;

          if (distance < minDist) {
            var moveX = (dx / distance) * (minDist - distance);
            var moveY = (dy / distance) * (minDist - distance);
            nodes[a].x -= moveX / 2;
            nodes[a].y -= moveY / 2;
            nodes[b].x += moveX / 2;
            nodes[b].y += moveY / 2;
          }
        }
      }
    }

    nodes.forEach(function(d) {
      d3.select(d.node)
        .attr("transform", `translate(${d.x},${d.y})`);
    });
  }

  forceDirectedLabelPlacement();
}

async function createTopTenContributorsChart(data) {
  // Select the container width
  var svgContainer = d3.select("#chart-0-container");
  var containerWidth = parseInt(svgContainer.style("width"));

  // Adjust dimensions based on container width
  var margin = { top: 40, right: 80, bottom: 200, left: 80 },
    width = containerWidth - margin.left - margin.right,
    height = (containerWidth * 0.75) - margin.top - margin.bottom; // Keep aspect ratio

  // Clear any existing SVG
  d3.select("svg").remove();

  var svg = svgContainer
    .append("svg")
    .attr("id", "chart-1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Scale the x-axis
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(
      data.map(function (d) {
        return d.login;
      })
    )
    .padding(0.2);

  // Append x-axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", Math.min(24, width / 25)); // Responsive font size

  // Scale the y-axis
  let maxContributions = d3.max(data, d => d.contributions);
  var y = d3.scaleLinear().domain([0, maxContributions]).range([height, 0]);

  // Append y-axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .style("font-size", Math.min(24, width / 25)); // Responsive font size

  // Draw the bars
  svg.selectAll(".bar")
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

async function createStargazersAndForksChart(response) {

  d3.select("svg").remove();

  // Select the container width
  var svgContainer = d3.select("#chart-0-container");
  var containerWidth = parseInt(svgContainer.style("width"));

  // Adjust dimensions based on container width
  var margin = { top: 20, right: 20, bottom: 100, left: 60 },
      width = containerWidth - margin.left - margin.right,
      height = (containerWidth * 0.75) - margin.top - margin.bottom; // Maintain aspect ratio

  var svg = svgContainer
    .append("svg")
    .attr("id", "chart-2")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let data = [
    { label: "Stargazers", value: response.stargazers_count },
    { label: "Forks", value: response.forks_count }
  ];

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
    .style("font-size", Math.min(24, width / 25)); // Responsive font size

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y))
    .style("font-size", Math.min(16, width / 35)); // Responsive font size

  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", "lightblue");

  // end of stargazers and forks function

}


async function createLengthActiveChart(data) {
  d3.select("svg").remove();

  function calculateDuration(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const diffDays = dateFns.differenceInCalendarDays(endDate, startDate);
    const years = Math.floor(diffDays / 365);
    const weeks = Math.floor((diffDays % 365) / 7);
    const days = diffDays % 7;

    return { years, weeks, days };
  }

  const startDateStr = data.created_at;
  const endDateStr = data.pushed_at;

  const duration = calculateDuration(startDateStr, endDateStr);

  var svgContainer = d3.select("#chart-0-container");

  var svg = svgContainer
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

  var squareMargin = 10;
  var colors = ["pink", "orange", "blue"];

  // Function to draw squares in each group and return the total width of the group
  function drawSquares(g, rowNum, count, color, squareSize) {
    for (let i = 0; i < count; i++) {
      var x = (i % rowNum) * (squareSize + squareMargin);
      var y = Math.floor(i / rowNum) * (squareSize + squareMargin);
      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    }
    const totalWidth = (rowNum * (squareSize + squareMargin)) - squareMargin;
    return totalWidth;
  }

  // Calculate the width of each group of squares
  const yearsWidth = drawSquares(svg.append("g"), 3, duration.years, colors[0], 40);
  const weeksWidth = drawSquares(svg.append("g"), 10, duration.weeks, colors[1], 20);
  const daysWidth = drawSquares(svg.append("g"), 1, duration.days, colors[2], 15);

  // Calculate total width for all groups combined
  const totalWidth = yearsWidth + weeksWidth + daysWidth + 4 * squareMargin;

  // Calculate starting positions to ensure equal spacing
  const startX = (800 - totalWidth) / 2;
  const weeksX = startX + yearsWidth + squareMargin * 2;
  const daysX = weeksX + weeksWidth + squareMargin * 2;

  // Append and transform each group
  svg.select("g:nth-child(1)").attr("transform", `translate(${startX}, 50)`);
  svg.select("g:nth-child(2)").attr("transform", `translate(${weeksX}, 50)`);
  svg.select("g:nth-child(3)").attr("transform", `translate(${daysX}, 50)`);

  // Calculate maxHeight manually since it was missing from the code
  const maxHeight = 50 + Math.max(
    Math.ceil(duration.years / 3) * (40 + squareMargin),
    Math.ceil(duration.weeks / 10) * (20 + squareMargin),
    Math.ceil(duration.days / 1) * (15 + squareMargin)
  );


  console.log(duration.years); // Ensure this logs correctly

  svg.append("text")
    .attr("x", 50)
    .attr("y", maxHeight + 40)  // Adjust y position based on the max height of squares
    .text(
      duration.years + " years, " +
      duration.weeks + " weeks, " +
      duration.days + " days"
    )
    .attr("fill", "white")
    .style("font-size", 24);
}
