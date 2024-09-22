async function createLanguageChart(languages) {
  d3.select("#chart-0-container svg").remove();

  var width = 1000; // Width of the chart
  var height = 700; // Height of the chart
  var margin = 120; // Margin around the pie chart

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

  var customRange = d3.schemeCategory10;
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

  // Tooltip div
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("padding", "4px 6px")
    .style("border-radius", "4px")
    .style("box-shadow", "0px 0px 2px rgba(0, 0, 0, 0.5)")
    .style("visibility", "hidden") // Initially hidden
    .style("color", "black") // Ensures text is visible
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("transform", "translate(-50%, -100%)") // Move tooltip to the center of the cursor
    .style("width", (window.innerWidth / 4) + "px"); // Set width to a quarter of the screen width

  // Adjust tooltip width on window resize
  window.addEventListener("resize", () => {
    tooltip.style("width", (window.innerWidth / 4) + "px");
  });

  // Tooltip functionality for both hover and click
  arcs
    .on("mouseover", function (event, d) {
      if (!tooltipPersisted) {
        showTooltip(event, d);
      }
    })
    .on("mousemove", function (event) {
      if (!tooltipPersisted) {
        moveTooltip(event);
      }
    })
    .on("mouseout", function () {
      if (!tooltipPersisted) {
        hideTooltip();
      }
    })
    .on("click", function (event, d) {
      // Show the tooltip on click for mobile users and make it persist
      showTooltip(event, d);
      tooltipPersisted = true; // Set the flag to true
    });

  // Variable to track if tooltip should persist
  let tooltipPersisted = false;

  // Function to show the tooltip
  function showTooltip(event, d) {
    tooltip
      .html(
        `<strong>${d.data.language}</strong><br>Count: ${d.data.count}<br>Percentage: ${(
          (d.data.count / total) *
          100
        ).toFixed(1)}%`
      )
      .style("visibility", "visible")
      .style("top", event.pageY - 10 + "px")
      .style("left", event.pageX + "px");
  }

  // Function to move the tooltip
  function moveTooltip(event) {
    var xPos = event.pageX;
    var yPos = event.pageY - 10;

    tooltip.style("top", yPos + "px").style("left", xPos + "px");
  }

  // Function to hide the tooltip
  function hideTooltip() {
    tooltip.style("visibility", "hidden");
  }

  // Handle touch events
  arcs
    .on("touchstart", function (event, d) {
      event.preventDefault(); // Prevent default behavior (like scrolling)
      showTooltip(event.touches[0], d);
      tooltipPersisted = true; // Set the flag to true
    })
    .on("touchmove", function (event) {
      event.preventDefault();
      if (!tooltipPersisted) {
        moveTooltip(event.touches[0]);
      }
    })
    .on("touchend", function () {
      if (!tooltipPersisted) {
        hideTooltip();
      }
    });

  // Hide the tooltip on scroll
  window.addEventListener("scroll", () => {
    if (tooltipPersisted) {
      hideTooltip();
      tooltipPersisted = false; // Reset the persistence flag
    }
  });
}






async function createTopTenContributorsChart(data) {
    // Clear any existing SVG
    d3.select("#chart-0-container svg").remove();

  // Select the container width
  var svgContainer = d3.select("#chart-0-container");
  if (svgContainer.empty()) {
    console.error("Chart container not found");
    return;
  }
  var containerWidth = parseInt(svgContainer.style("width"));

  // Adjust dimensions based on container width
  var margin = {
      top: containerWidth < 500 ? 30 : 40,
      right: containerWidth < 500 ? 40 : 80,
      bottom: containerWidth < 500 ? 80 : 200,
      left: containerWidth < 500 ? 40 : 80
    },
    width = containerWidth - margin.left - margin.right,
    height = containerWidth < 500 ? containerWidth * 0.8 - margin.top - margin.bottom : containerWidth * 0.6 - margin.top - margin.bottom; // Give more vertical space on mobile



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
    .style("font-size", Math.min(18, width / 30)); // Responsive font size

  // Scale the y-axis
  let maxContributions = d3.max(data, d => d.contributions);
  var y = d3.scaleLinear().domain([0, maxContributions]).range([height, 0]);

  // Append y-axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .style("font-size", Math.min(18, width / 30)); // Responsive font size

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

  // Make the SVG responsive by scaling to parent container
  d3.select("#chart-1")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto");
}


//end top ten contributors function

async function createStargazersAndForksChart(response) {

  d3.select("#chart-0-container svg").remove();

  // Select the container width
  var svgContainer = d3.select("#chart-0-container");
  if (svgContainer.empty()) {
    console.error("Chart container not found");
    return;
  }
  var containerWidth = parseInt(svgContainer.style("width"));


document.body.offsetHeight; // Force a reflow

  var margin = {
    top: containerWidth < 500 ? 30 : 40,
    right: containerWidth < 500 ? 40 : 80,
    bottom: containerWidth < 500 ? 80 : 200,
    left: containerWidth < 500 ? 40 : 80
  },
  width = containerWidth - margin.left - margin.right,
  height = containerWidth < 500 ? containerWidth * 0.8 - margin.top - margin.bottom : containerWidth * 0.6 - margin.top - margin.bottom; // Give more vertical space on mobile

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
  d3.select("#chart-0-container svg").remove();

    var svgContainer = d3.select("#chart-0-container");
    if (svgContainer.empty()) {
      console.error("Chart container not found");
      return;
    }
  var containerWidth = parseInt(svgContainer.style("width"));

  var margin = {
    top: containerWidth < 500 ? 30 : 40,
    right: containerWidth < 500 ? 40 : 80,
    bottom: containerWidth < 500 ? 80 : 200,
    left: containerWidth < 500 ? 40 : 80
  },
  width = containerWidth - margin.left - margin.right,
  height = containerWidth < 500 ? containerWidth * 0.8 - margin.top - margin.bottom : containerWidth * 0.6 - margin.top - margin.bottom; // Give more vertical space on mobile



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
  if (svgContainer.empty()) {
    console.error("Chart container not found");
    return;
  }

  var svg = svgContainer
    .append("svg")
    .attr("viewBox", `0 0 800 500`) // Set viewBox for responsive scaling
    .attr("preserveAspectRatio", "xMidYMid meet") // Preserve aspect ratio
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

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
