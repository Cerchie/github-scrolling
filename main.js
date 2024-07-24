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
  console.log(chosenOwner, chosenRepo);

  try {
    const [languages, topTenContributors, stargazersAndForks, size, lengthActive] = await Promise.all([
      responseData.getLanguages(owner, repo),
      responseData.getTopTenContributors(owner, repo),
      responseData.getStargazersAndForks(owner, repo),
      responseData.getSize(owner, repo),
      responseData.getLengthActive(owner, repo)
    ]);
    console.log([languages, topTenContributors, stargazersAndForks, size, lengthActive])

const scroller = scrollama();

const callbacksWithData = [
  { callback: createLanguageChart, data: languages },
  { callback: createTopTenContributorsChart, data: topTenContributors },
  { callback: createStargazersAndForksChart, data: stargazersAndForks },
  { callback: createLengthActiveChart, data: lengthActive },
  { callback: createSizeChart, data: size }
];

const steps = d3.selectAll(".step");

// Setup the instance, pass callback functions
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

  const { callback, data } = callbacksWithData[index];

  if (callback && data) {
    callback(data); 
    d3.select(steps.nodes()[index]).classed("active", true); 
    console.log("enter", response);
  } else {
    console.log("Error: Invalid index or missing callback or data.");
  }

  currentStepIndex = index;

  console.log("enter", response);
}

// Callback function for onStepExit
function handleStepExit(response) {
  const index = response.index;

  // Remove 'active' class from the current step to fade it out
  d3.select(steps.nodes()[index]).classed("active", false);

  console.log("exit", response);
}

  } catch (error) {
    console.error('Failed to fetch data from GitHub API:', error);
  }
  });