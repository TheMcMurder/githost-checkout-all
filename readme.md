# Githost Checkout All

This is a small quick and dirty script that pulls all repos from a hosted gitlab instace that for some _crazy_ reason doesn't have global code search

It's probably full of bugs, it's not published nicely, it requires several things on your path, so use at your own risk.

## Config

pull the project/install dependencies and create a new file called config.json at the root. `config.json` should have the same keys as `config.example.json`.

### Getting an api key

note: this is only necessary if you have private repos

Go to your account in gitlab and select AccessTokens, and create a personal access token with rights to checkout repos. [Direct gitlab url](https://gitlab.com/profile/personal_access_tokens). 

### Setting the base url

For normal gitlab it's `https://gitlab.com`, for hosted gitlab it'll be custom. For example: `https://example.githost.io`

## Running the project

Ensure you're in the the correct folder then type `node src/index.js` in your terminal. Assuming not bugs it should do the following:
- Pull Projects you don't have on your machine
- Checkout master and pull latest for existing projects (WIP)

