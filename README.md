# Wollok ShowCase Webapp

A web application to see and run live examples of wollok code.

All of the examples and wollok code is actually took from the wollok source code (https://github.com/uqbar-project/wollok)
from this folder (https://github.com/uqbar-project/wollok/tree/master/wollok-tests).

The app is based on the following stack:
* NodeJS
* ExpressJS
* Angular

# Running the app

First clone the repo
```bash
git clone https://github.com/javierfernandes/wollok-showcase-app.git
cd wollok-showcase-app
```

Then install all dependencies

```bash
npm install
```

Then fetch the wollok examples

```bash
gulp fetch-examples
``

That will create a folder named "data" with the wollok example files.

Then start the app with

```bash
npm start
```