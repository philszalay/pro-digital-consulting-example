# Pro Digital Consulting Example

<img width="1280" alt="Screenshot 2024-05-30 at 10 54 30" src="https://github.com/philszalay/pro-digital-consulting-example/assets/12916001/dd079ff1-f304-4b21-9d15-fb77e48098ce">
https://philszalay.github.io/threejs-boilerplate/

## Setup
Download [Node.js 16](https://nodejs.org/en/download/).

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

## Deployment
To deploy the app with gh-pages some prerequisites are necessary.

### Install gh-pages
``` bash
npm install gh-pages --save-dev
```

For more information see: https://www.npmjs.com/package/gh-pages

### Deployment Script
To deploy your changes use the predefined deploy script. 

``` bash
# Build for production in the `dist` directory and publish the folder's content to the `gh-pages` branch
npm run deploy
```

Running the script for the first time will do the initial setup automatically and your project will be published automatically. The gh-pages settings can be found in your repository settings (`Settings -> Pages`).

## Formatting/Linting
Install https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint in your VS Code to use eslint for formatting and linting. A configuration file (`.eslintrc.js`) is already provided in the project.
