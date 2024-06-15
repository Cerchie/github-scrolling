class ResponseData {
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }

     async getLanguages(owner, repo) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
        const languages = await response.json();
        return languages;
      }

    async getTopTenContributors(owner, repo) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`);
        const topContributorsFirstPage = await response.json();
        const topTenContributors = topContributorsFirstPage.slice(0, 10);
        return topTenContributors;
      }
      async getStargazersAndForks(owner, repo) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const fullData = await response.json();
        const forks_count = fullData.forks_count;
        const stargazers_count = fullData.stargazers_count;
        return {stargazers_count, forks_count};
      }
      async getLengthActive(owner, repo) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const fullData = await response.json();
        const created_at = fullData.created_at;
        const pushed_at = fullData.pushed_at;
        return {created_at, pushed_at};
      }
      async getSize(owner, repo) {
        //https://stackoverflow.com/questions/8646517/how-can-i-see-the-size-of-a-github-repository-before-cloning-it
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const fullData = await response.json();
        const size = fullData.size;
        return size;
      }
}

export default ResponseData;

// const responseData = new ResponseData;


//   (async () => {
//    console.log(await responseData.getSize("apache", "flink"))
//   })();