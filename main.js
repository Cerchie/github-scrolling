let owner = "";
let repo = "";

const responseData = new ResponseData();

const f = document.getElementById("repo_owner_form");

f.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Reset owner, repo, and step index on each submission
  owner = "";
  repo = "";
  currentStepIndex = -1;

  try {
    // Clear all existing charts and scroller before processing the new submission
    clearAllCharts();

    // Clear any previous error messages
    const errorMessage = document.getElementsByClassName("error-message");
    if (errorMessage.length > 0) {
      errorMessage[0].innerHTML = "";
    }

    // Get owner and repository from the input fields
    const chosenOwner = document.getElementById("owner").value;
    const chosenRepo = document.getElementById("repo").value;

    // Validate inputs
    if (!chosenOwner || !chosenRepo) {
      throw new Error("Owner and repository fields must not be empty.");
    }

    // Assign new owner and repo values
    owner = chosenOwner;
    repo = chosenRepo;

    console.log("Chosen Owner:", chosenOwner);
    console.log("Chosen Repo:", chosenRepo);

    // Fetch data from the GitHub API for the selected repository
    const [languages, topTenContributors, stargazersAndForks, lengthActive] = await Promise.all([
      responseData.getLanguages(owner, repo).catch(e => ({ error: e })),
      responseData.getTopTenContributors(owner, repo).catch(e => ({ error: e })),
      responseData.getStargazersAndForks(owner, repo).catch(e => ({ error: e })),
      responseData.getLengthActive(owner, repo).catch(e => ({ error: e })),
    ]);

    if ([languages, topTenContributors, stargazersAndForks, lengthActive].some(result => result.error)) {
      throw new Error("One or more API calls failed");
    }

    // Check if any data failed to fetch
    if ([languages, topTenContributors, stargazersAndForks, lengthActive].includes(undefined)) {
      throw new Error("Failed to fetch data from GitHub API. Check your owner and repository name and try again.");
    }

    console.log("Fetched Data:", { languages, topTenContributors, stargazersAndForks, lengthActive });

    // Reinitialize the scroller and render charts
    reinitializeScrollytelling(languages, topTenContributors, stargazersAndForks, lengthActive);

  } catch (error) {
    console.error('Failed to process form submission:', error);

    // Display error messages if they occur
    if (errorMessage.length > 0) {
      errorMessage[0].innerHTML = `Error: ${error.message || 'An unexpected error occurred.'}`;
    }
  }
});

function clearAllCharts() {
  console.log("Clearing all charts...");
  d3.selectAll("#chart-0-container svg").remove();  // Clear all SVG elements within the specific container
  d3.selectAll(".step").classed("active", false);   // Deactivate all steps
}

function reinitializeScrollytelling(languages, topTenContributors, stargazersAndForks, lengthActive) {

  const scroller = scrollama();

  // Chart creation callbacks mapped to their data
  const callbacksWithData = [
    { callback: createLanguageChart, data: languages },
    { callback: createTopTenContributorsChart, data: topTenContributors },
    { callback: createStargazersAndForksChart, data: stargazersAndForks },
    { callback: createLengthActiveChart, data: lengthActive },
  ];

  // Select step elements
  const steps = d3.selectAll(".step");

  if (steps.empty()) {
    console.error("No .step elements found. Ensure the HTML structure is correct.");
    return;
  }

  // Adjust the setup for mobile
  scroller
    .setup({ step: ".step", offset: window.innerWidth < 768 ? 0.7 : 0.5, debug: false })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  // Handle scroll step enter
  function handleStepEnter(response) {
    console.log(`Entering step ${response.index} with function: ${callbacksWithData[response.index].callback.name}`);
    const index = response.index;
    const { callback, data } = callbacksWithData[index];

    if (callback && data) {
   
        callback(data);
        d3.select(steps.nodes()[index]).classed("active", true);

    } else {
      console.error("Error: Invalid index or missing callback or data.");
    }

    currentStepIndex = index;
  }

  // Handle scroll step exit
  function handleStepExit(response) {
    const index = response.index;
    d3.select(steps.nodes()[index]).classed("active", false);
    console.log("Step Exit:", response);
  }
}

