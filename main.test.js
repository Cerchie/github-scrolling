import { JSDOM } from 'jsdom';
import * as d3 from 'd3';

// Mock the DOM using JSDOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
  <body>
    <form id="repo_owner_form">
      <input id="owner" value="" />
      <input id="repo" value="" />
      <button type="submit">Submit</button>
    </form>
    <div class="error-message"></div>
    <div class="step"></div>
    <div class="step"></div>
    <div class="step"></div>
    <div class="step"></div>
  </body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;

const responseData = {
  getLanguages: jest.fn(),
  getTopTenContributors: jest.fn(),
  getStargazersAndForks: jest.fn(),
  getLengthActive: jest.fn(),
};

global.ResponseData = function() {
  return responseData;
};


let createLanguageChart = jest.fn();
let createTopTenContributorsChart = jest.fn();
let createStargazersAndForksChart = jest.fn();
let createLengthActiveChart = jest.fn();

import clearAllCharts from './main.js';

describe('repo_owner_form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.getElementById('owner').value = '';
    document.getElementById('repo').value = '';
    document.querySelector('.error-message').innerHTML = '';
  });

  test('should handle empty form submission', async () => {
    const form = document.getElementById('repo_owner_form');
    form.dispatchEvent(new dom.window.Event('submit'));

    expect(responseData.getLanguages).not.toHaveBeenCalled();
    expect(responseData.getTopTenContributors).not.toHaveBeenCalled();
    expect(responseData.getStargazersAndForks).not.toHaveBeenCalled();
    expect(responseData.getLengthActive).not.toHaveBeenCalled();

    const errorMessage = document.querySelector('.error-message').innerHTML;
    expect(errorMessage).toBe('Error: Owner and repository fields must not be empty.');
  });

  test('should call clearAllCharts and show an error message if owner or repo is empty', async () => {
    document.getElementById('owner').value = 'testOwner';
    const form = document.getElementById('repo_owner_form');
    form.dispatchEvent(new dom.window.Event('submit'));

    expect(clearAllCharts).toHaveBeenCalled();
    const errorMessage = document.querySelector('.error-message').innerHTML;
    expect(errorMessage).toBe('Error: Owner and repository fields must not be empty.');
  });

  test('should fetch data and call appropriate chart functions', async () => {
    document.getElementById('owner').value = 'testOwner';
    document.getElementById('repo').value = 'testRepo';

    responseData.getLanguages.mockResolvedValueOnce({ JavaScript: 50 });
    responseData.getTopTenContributors.mockResolvedValueOnce([{ login: 'user1', contributions: 100 }]);
    responseData.getStargazersAndForks.mockResolvedValueOnce({ stargazers_count: 150, forks_count: 50 });
    responseData.getLengthActive.mockResolvedValueOnce({ years: 2, weeks: 5, days: 3 });

    const form = document.getElementById('repo_owner_form');
    await form.dispatchEvent(new dom.window.Event('submit'));

    expect(clearAllCharts).toHaveBeenCalled();
    expect(responseData.getLanguages).toHaveBeenCalledWith('testOwner', 'testRepo');
    expect(responseData.getTopTenContributors).toHaveBeenCalledWith('testOwner', 'testRepo');
    expect(responseData.getStargazersAndForks).toHaveBeenCalledWith('testOwner', 'testRepo');
    expect(responseData.getLengthActive).toHaveBeenCalledWith('testOwner', 'testRepo');
    expect(createLanguageChart).toHaveBeenCalledWith({ JavaScript: 50 });
    expect(createTopTenContributorsChart).toHaveBeenCalledWith([{ login: 'user1', contributions: 100 }]);
    expect(createStargazersAndForksChart).toHaveBeenCalledWith({ stargazers_count: 150, forks_count: 50 });
    expect(createLengthActiveChart).toHaveBeenCalledWith({ years: 2, weeks: 5, days: 3 });
  });

  test('should handle errors and display error message', async () => {
    document.getElementById('owner').value = 'testOwner';
    document.getElementById('repo').value = 'testRepo';

    responseData.getLanguages.mockRejectedValueOnce(new Error('Failed to fetch data'));

    const form = document.getElementById('repo_owner_form');
    await form.dispatchEvent(new dom.window.Event('submit'));

    const errorMessage = document.querySelector('.error-message').innerHTML;
    expect(errorMessage).toBe('Error: Failed to fetch data');
  });
});
