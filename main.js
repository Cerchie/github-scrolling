let owner = "";
let repo = "";

const responseData = new ResponseData();

const f = document.getElementById("repo_owner_form");
f.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  try {
    // Clear all existing charts before processing the new submission
    clearAllCharts();

    const errorMessage = document.getElementsByClassName("error-message");
    if (errorMessage.length > 0) {
      errorMessage[0].innerHTML = "";
    }

    const chosenOwner = document.getElementById("owner").value;
    const chosenRepo = document.getElementById("repo").value;

    if (!chosenOwner || !chosenRepo) {
      throw new Error("Owner and repository fields must not be empty.");
    }

    owner = chosenOwner;
    repo = chosenRepo;
    
    console.log("Chosen Owner:", chosenOwner);
    console.log("Chosen Repo:", chosenRepo);

    const [languages, topTenContributors, stargazersAndForks, lengthActive] = await Promise.all([
      responseData.getLanguages(owner, repo),
      responseData.getTopTenContributors(owner, repo),
      responseData.getStargazersAndForks(owner, repo),
      responseData.getLengthActive(owner, repo)
    ]);
    
    console.log("Fetched Data:", { languages, topTenContributors, stargazersAndForks, lengthActive });

    const scroller = scrollama();

    const callbacksWithData = [
      { callback: createLanguageChart, data: languages },
      { callback: createTopTenContributorsChart, data: topTenContributors },
      { callback: createStargazersAndForksChart, data: stargazersAndForks },
      { callback: createLengthActiveChart, data: lengthActive },
    ];

    const steps = d3.selectAll(".step");

    scroller
      .setup({ step: ".step" })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);

    let currentStepIndex = -1;

    function handleStepEnter(response) {
      const index = response.index;
      const { callback, data } = callbacksWithData[index];

      if (callback && data) {
        callback(data); 
        d3.select(steps.nodes()[index]).classed("active", true); 
        console.log("Step Enter:", response);
      } else {
        console.log("Error: Invalid index or missing callback or data.");
      }

      currentStepIndex = index;
    }

    function handleStepExit(response) {
      const index = response.index;
      d3.select(steps.nodes()[index]).classed("active", false);
      console.log("Step Exit:", response);
    }

  } catch (error) {
    console.error('Failed to process form submission:', error);
    const errorMessage = document.getElementsByClassName("error-message");
    if (errorMessage.length > 0) {
      errorMessage[0].innerHTML = `Error: ${error.message}`;
    }
  }
});


function clearAllCharts() {
  d3.selectAll("svg").remove();
  d3.selectAll(".step").classed("active", false);
}
