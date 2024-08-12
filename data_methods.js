class ResponseData {
  constructor(owner, repo) {
    this.owner = owner;
    this.repo = repo;
  }

  async getRepo(owner, repo) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found.`);
        } else if (response.status === 403) {
          throw new Error(`Access to repository '${owner}/${repo}' forbidden.`);
        } else {
          throw new Error(
            `Failed to fetch data from GitHub API: ${response.status} ${response.statusText}`,
          );
        }
      }
    } catch (error) {
      // Handle errors and display appropriate message to the user
      console.error("Error fetching data:", error.message);
      displayErrorMessage(error.message);
    }
  }

  async getLanguages(owner, repo) {

   
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found.`);
        } else if (response.status === 403) {
          throw new Error(`Access to repository '${owner}/${repo}' forbidden.`);
        } else {
          throw new Error(
            `Failed to fetch data from GitHub API: ${response.status} ${response.statusText}`,
          );
        }
      }

      const languages = await response.json();
      return languages;
    } catch (error) {
      // Handle errors and display appropriate message to the user
      console.error("Error fetching data:", error.message);
    }
  }

  async getTopTenContributors(owner, repo) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found.`);
        } else if (response.status === 403) {
          throw new Error(`Access to repository '${owner}/${repo}' forbidden.`);
        } else {
          throw new Error(
            `Failed to fetch data from GitHub API: ${response.status} ${response.statusText}`,
          );
        }
      }

      const topContributorsFirstPage = await response.json();
      const topTenContributors = topContributorsFirstPage.slice(0, 10);
      return topTenContributors;
    } catch (error) {
      // Handle errors and display appropriate message to the user
      console.error("Error fetching data:", error.message);
    }
  }
  async getStargazersAndForks(owner, repo) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found.`);
        } else if (response.status === 403) {
          throw new Error(`Access to repository '${owner}/${repo}' forbidden.`);
        } else {
          throw new Error(
            `Failed to fetch data from GitHub API: ${response.status} ${response.statusText}`,
          );
        }
      }

      const fullData = await response.json();
      const forks_count = fullData.forks_count;
      const stargazers_count = fullData.stargazers_count;
      return { stargazers_count, forks_count };
    } catch (error) {
      // Handle errors and display appropriate message to the user
      console.error("Error fetching data:", error.message);
    }
  }
  async getLengthActive(owner, repo) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found.`);
        } else if (response.status === 403) {
          throw new Error(`Access to repository '${owner}/${repo}' forbidden.`);
        } else {
          throw new Error(
            `Failed to fetch data from GitHub API: ${response.status} ${response.statusText}`,
          );
        }
      }

      const fullData = await response.json();
      const created_at = fullData.created_at;
      const pushed_at = fullData.pushed_at;
      return { created_at, pushed_at };
    } catch (error) {
      // Handle errors and display appropriate message to the user
      console.error("Error fetching data:", error.message);
    }
  }
}

function displayErrorMessage(message) {
  const errorElement = document.querySelector(".error-message");
  errorElement.textContent = message;
  errorElement.style.color = "red";
}
