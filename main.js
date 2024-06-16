const width = 400;
const height = 400;

let owner = "";
let repo = "";

const responseData = new ResponseData;

const f = document.getElementById("repo_owner_form")

f.addEventListener("submit", async (event) => {
  event.preventDefault()
  const chosenOwner = document.getElementById("owner").value
  owner = chosenOwner;
  const chosenRepo = document.getElementById("repo").value
  repo = chosenRepo;
  display(await createDataArray());

})



async function createLanguageChart(){
    const languages = await responseData.getLanguages(owner, repo);


// set the dimensions and margins of the graph
var width = 400
var height = 400
var margin = 0

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")


// get data
var data = languages;

  var customRange = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b',
    '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7',
    '#98df8a', '#aec7e8', '#c5b0d5', '#ffbb78', '#c49c94',
    '#f7b6d2', '#c7c7c7', '#bcbd22', '#ffbb78', '#17becf',
    '#9edae5', '#aec7e8', '#1f77b4', '#ff7f0e', '#2ca02c',
    '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
    '#bcbd22', '#17becf', '#aec7e8', '#ff9896', '#9467bd',
    '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2'
  ];
  




var color = d3.scaleOrdinal().domain(Object.keys(data)).range(customRange.slice(0, Object.keys(data).length - 1));
// Compute the position of each group on the pie:
var pie = d3.pie()
  .value(function(d) { return d[1]; })


var data_ready = pie(Object.entries(data))

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('pieces')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
  )
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("opacity", 1)


  // Add labels

  var arc = d3.arc()
  .innerRadius(0) // Inner radius of the arc (for pie or donut charts)
  .outerRadius(radius); // Outer radius of the arc (based on your chart setup)

svg.selectAll('text')
.data(data_ready)
.enter()
.append('text')
.text(function(d) { return d.data[0]})
.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")";  })
.style("font-size", 17)


//end language function
}

async function createTopTenContributorsChart(){
d3.select("#lang_chart").style("display", "none");
    const data = await responseData.getTopTenContributors(owner, repo);
console.log(data)

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 30},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("svg")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")
          .attr("id", "lang_chart");

// Parse the Data
console.log(data.map(function(d) { return d.login; }))
// X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(function(d) { return d.login; }))
  .padding(0.2);

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    let maxContributions = d3.max(data.map(function(d) { return d.contributions; }))  
// Add Y axis
var y = d3.scaleLinear()
  .domain([0, maxContributions])
  .range([ height, 0]);

svg.append("g")
  .call(d3.axisLeft(y));

// Bars
svg.selectAll("mybar")
  .data(data)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.login); })
    .attr("y", function(d) { return y(d.contributions); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.contributions); })
    .attr("fill", "#69b3a2")


}

//end top ten contributors function


// instantiate the scrollama
const scroller = scrollama();

const callbacks = [
    createLanguageChart,
    createTopTenContributorsChart]
const steps = d3.selectAll('.step');
// setup the instance, pass callback functions
scroller
  .setup({
    step: ".step",
  })
  .onStepEnter((response) => {
    d3.select('#chart').style('opacity', 1)
    callbacks[response.index]();
    steps.style('opacity', 0.1);
    d3.select(response.element).style('opacity', 1)
    console.log('enter', response);

  })
  .onStepExit((response) => {
    
    d3.select(response.element).style('opacity', 0)
    console.log('exit', response);
  });