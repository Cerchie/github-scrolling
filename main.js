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
console.log(owner, repo)


async function createLanguageChart(){
    const languages = await responseData.getLanguages(owner, repo);
console.log(languages)

// set the dimensions and margins of the graph
var width = 400
var height = 400
var margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// get data
var data = languages;
console.log(data)

var min = Math.min(...Object.values(data))
var max = Math.max(...Object.values(data))

// set the color scale
var color = d3.scaleOrdinal()
  .domain([min, max])
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Compute the position of each group on the pie:
var pie = d3.pie()
  .value(function(d) {console.log('d val', d); return d[1]; })


var data_ready = pie(Object.entries(data))
console.log(data_ready)
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
  .style("opacity", 0.7)


  // Add labels

  var arc = d3.arc()
  .innerRadius(0) // Inner radius of the arc (for pie or donut charts)
  .outerRadius(radius); // Outer radius of the arc (based on your chart setup)

svg.selectAll('text')
.data(data_ready)
.enter()
.append('text')
.text(function(d) { return d.data[0]})
.attr('transform', function(d) {
  var pos = arc.centroid(d);
  return 'translate(' + pos + ')';
})
.style('text-anchor', 'middle')
.style('font-size', '12px');

//end language function
}



const data = d3.range(20).map(() => ({x: Math.random()* width, y: Math.random()*height}));

const circles = d3.select('svg').selectAll('circle').data(data)
.join('circle')
.attr('cx', width/2)
.attr('cy', height/2)
.attr('r', width/2)
.style('fill', 'lightblue')

function moveLeft() {
    circles.transition().duration(750).attr('cx', 10)
}

function moveX() {
    circles.transition().duration(750).attr('cx', (d) => d.x)
}

function moveY() {
    circles.transition().duration(750).attr('cy', (d) => d.y)
}

// instantiate the scrollama
const scroller = scrollama();

const callbacks = [
    createLanguageChart,
    moveX,
    moveY,
    moveLeft,
    moveX,]
const steps = d3.selectAll('.step');
// setup the instance, pass callback functions
scroller
  .setup({
    step: ".step",
  })
  .onStepEnter((response) => {
    callbacks[response.index]();
    steps.style('opacity', 0.1);
    d3.select(response.element).style('opacity', 1)
    console.log('enter', response);
  })
  .onStepExit((response) => {
    d3.select('g').style('opacity', 0)
    console.log('exit', response);
  });