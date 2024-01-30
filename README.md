# jira-ticket-linker-for-test

Simple Visual Studio Code extension to make Jira links in `markdown` and `typescript` files "alive" (so you can click them and navigate to the issue in your default web browser).

## Setup

### Setup your JIRA configurations in VSC settings, for example:
```
{
  "jira.config": [
    {
      "code": "ECO",
      "url": "https://jira.atlassian.com/browse/"
    },
    {
      "code": "CRUC",
      "url": "https://jira.atlassian.com/browse/"
    }
  ]
}
```
### Install the extension
For now, I'll keep this extension off the marketplace. To install it, check for the latest release in this repo, download it and install it using:
```
code --install-extension <extensionName>.vsix
```

### Enjoy
Now wherever you open a `typescript` or `markdown` file, extension will look for JIRA issue ids (e.g. `ECO-1234`), and create links from them using `url` as prefix.
