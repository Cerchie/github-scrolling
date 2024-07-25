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

    function adjustLabelPositions() {
      var labelNodes = labels.nodes();
      var labelBoxes = labelNodes.map(function (labelNode) {
        return labelNode.getBBox();
      });
    
      // Sort label boxes by their y position
      labelBoxes.sort((a, b) => a.y - b.y);
    
      // Loop through labels from top to bottom and adjust positions if needed
      for (var i = 0; i < labelBoxes.length; i++) {
        for (var j = i + 1; j < labelBoxes.length; j++) {
          // Check if labels i and j overlap
          if (isOverlapping(labelBoxes[i], labelBoxes[j])) {
            // Calculate the minimum distance to move label j above label i
            var distanceToMove = labelBoxes[i].y + labelBoxes[i].height - labelBoxes[j].y;
            
            // Adjust y position of label j to avoid overlap
            d3.select(labelNodes[j]).attr("transform", `translate(${labelBoxes[j].x},${labelBoxes[j].y + distanceToMove + 10})`);
            
            // Update label box position
            labelBoxes[j].y += distanceToMove + 10; // Add some padding (10 units) between labels
          }
        }
    
        // Adjust horizontal position based on centroid calculation
        var label = d3.select(labelNodes[i]);
        var data = label.datum();
        var pos = arc.centroid(data);
        var midAngle = Math.atan2(pos[1], pos[0]);
        var x = Math.cos(midAngle) * (radius + 50); // Adjust radius or multiplier as needed
        var y = Math.sin(midAngle) * (radius + 50); // Adjust radius or multiplier as needed
    
        // Determine text-anchor based on the position of the label
        var anchor = Math.cos(midAngle) > 0 ? "start" : "end";
    
        // Apply the updated transform with adjusted x and y positions
        label.attr("transform", `translate(${x},${y})`)
             .style("text-anchor", anchor);
      }
    }
    

  function isOverlapping(box1, box2) {
    return !(box1.x + box1.width < box2.x || box2.x + box2.width < box1.x || box1.y + box1.height < box2.y || box2.y + box2.height < box1.y);
  }

  // Call adjustLabelPositions initially and after a delay to allow rendering
  setTimeout(adjustLabelPositions, 10);

  // End of language function
}



async function createTopTenContributorsChart(data) {
  var margin = { top: 20, right: 20, bottom: 150, left: 90 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
  d3.select("svg").remove();
  var svgContainer = d3.select("#chart-0-container");

  var svgWidth = width + margin.left + margin.right;
  var svgHeight = height + margin.top + margin.bottom;
  
  var svg = svgContainer
    .append("svg")
    .attr("id", "chart-1")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

  var y = d3.scaleLinear().domain([0, maxContributions]).range([height, 0]);

  svg.append("g").call(d3.axisLeft(y)).style("font-size", 24);;

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

async function createStargazersAndForksChart(response) {

  d3.select("svg").remove();

  var margin = { top: 20, right: 20, bottom: 150, left: 90 },
      width = 500 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var svgWidth = width + margin.left + margin.right;
  var svgHeight = height + margin.top + margin.bottom;

  var svgContainer = d3.select("#chart-0-container");

  var svg = svgContainer
    .append("svg")
    .attr("id", "chart-2")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
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
    .style("font-size", 16);

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y))
    .style("font-size", 16);

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

    const diffMonths = dateFns.differenceInCalendarMonths(endDate, startDate);
    const diffDays = dateFns.differenceInCalendarDays(endDate, startDate);

    // Calculate years and remaining months
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    return { years, months, days: diffDays };
  }

  const startDateStr = data.created_at;
  const endDateStr = data.pushed_at;

  const duration = calculateDuration(startDateStr, endDateStr);

  var svgContainer = d3.select("#chart-0-container");

  var svg = svgContainer
    .append("svg")
    .attr("width", 800) 
    .attr("height", 200); 

  var g = svg.append("g");

 
  g.append("text")
    .attr("x", 50) // Adjust x position as needed
    .attr("y", 50) // Adjust y position as needed
    .text(
        duration.years + " years, " +
        duration.months + " months, " +
        duration.days + " days"
    ).attr("fill", "white").style("font-size", 60); 
}

async function createSizeChart(data) {
  d3.select("svg").remove();

  var svgContainer = d3.select("#chart-0-container");
  var svg = svgContainer
    .append("svg")
    .attr("width", 600) 
    .attr("height", 400); 

  svg.append("text")
    .attr("x", 300) 
    .attr("y", 200) 
    .style("font-size", "30px")
    .style("fill", "white")
    .style("text-anchor", "middle") 
    .text(data.toString() + " KB");
}
