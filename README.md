# Macarte-utils
Library to use with Ma carte

## Installation 

Install project and dependencies

> npm install

## Development

### Run tests page

> npm start

Test are available at http://localhost:1234/

### Static code analysis

Use lint to run analysis

> npm run lint

to run analysis on example pages

> npm run lintex

### Documentation

> npm run doc

The documentation will be created at  `./docs/doc`


## Build and test instance

You have to build the app before commit. The build will be deploy on the test instance.
Before build take care to run static analysis and fix errors (`npm run lint`).

```
npm run build
```

NB: You may have to clean manually the build repository before runing the build to remove unecessary files.

## LICENSE

Copyright (c) IGN-France. All rights reserved.

Code is licensed under the [MIT](/LICENSE) license.

**NB**: This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work.

**Important Notice**: Notice concerning graphic elements - Please note that the logos, images and graphic elements associated with IGN, included in this repository, are protected by copyright and are not covered by the MIT licence. Use of these elements is subject to applicable laws and regulations and must be made in accordance with the rights and permissions granted by the respective owners
