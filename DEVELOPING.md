# Developing

## Installing dependencies

The minimum requirements are:
* Git
* [Node.js](https://nodejs.org/)
The executables git and node should be in your PATH.

To install the project dependencies run

> npm install

## Run tests page

> npm start

Test are available at http://localhost:1234/

## Static code analysis

Use lint to run analysis

> npm run lint

to run analysis on example pages

> npm run lintex

# Test instance and 

## Build a test instance

You have to build the app to bundle and optimize your application for production using the build command.  
The build will be available in the `./docs/mcutils` directory and can be deploy on the Github pages.   
Before build take care to run static analysis and fix errors (`npm run lint`).

```
npm run build
```

NB: You may have to clean manually the build repository before running the build to remove unnecessary files.

## Building Documentation

> npm run doc

The documentation will be created at  `./docs/doc` and can be deploy on the Github pages.
