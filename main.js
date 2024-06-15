const width = 400;
const height = 400;

let owner = "";
let repo = "";

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
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY,
    moveLeft,
    moveX,
    moveY
]
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
    console.log('exit', response);
  });