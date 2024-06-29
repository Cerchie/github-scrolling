const width = 400;
const height = 400;

let owner = "";
let repo = "";

const responseData = new ResponseData();

const f = document.getElementById("repo_owner_form");

f.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorMessage = document.getElementsByClassName("error-message");
  errorMessage[0].innerHTML = "";
  const chosenOwner = document.getElementById("owner").value;
  owner = chosenOwner;
  const chosenRepo = document.getElementById("repo").value;
  repo = chosenRepo;

  responseData.getRepo(owner, repo);
});

// instantiate the scrollama
const scroller = scrollama();

const callbacks = [
  createLanguageChart,
  createTopTenContributorsChart,
  createStargazersAndForksChart,
  createLengthActiveChart,
  createSizeChart,
];
const steps = d3.selectAll(".step");
// setup the instance, pass callback functions
scroller
  .setup({
    step: ".step",
  })
  .onStepEnter(handleStepEnter) // Define the onStepEnter callback
  .onStepExit(handleStepExit); // Define the onStepExit callback

let currentStepIndex = -1; // Variable to keep track of the current step index

// Callback function for onStepEnter
function handleStepEnter(response) {
  const index = response.index;

  // Reset SVG content based on the chart type (assuming callbacks[index] corresponds to createLanguageChart or createTopTenContributorsChart)
  callbacks[index]();

  // Update the current step index
  currentStepIndex = index;
  // Show the chart for the current step
  d3.select("#chart-" + index).style("opacity", 1);
  // Highlight the current step
  d3.selectAll(".step").style("opacity", (d, i) => (i === index ? 1 : 0));

  console.log("enter", response);
}

// Callback function for onStepExit
// Callback function for onStepExit
function handleStepExit(response) {
  const index = response.index;

  // Hide the current chart on exit
  d3.select("#chart-" + index).style("opacity", 0);

  console.log("exit", response);
}
