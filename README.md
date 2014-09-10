<a href="https://github.com/concordiajs/concordia"><img src="https://raw.githubusercontent.com/concordiajs/concordia/master/images/concordia.png" align="center"  height="300" width="600"/></a>

# Concordia
[![wercker status](https://app.wercker.com/status/cda739f10bd52559975e497cbdbbe9c3/s/master "wercker status")](https://app.wercker.com/project/bykey/cda739f10bd52559975e497cbdbbe9c3)
[![NPM version](https://badge.fury.io/js/concordia.svg)](http://badge.fury.io/js/concordia)

Concordia is a tiny framework helping you write modular applications.
Start your project in a single file, then scale upwards as needed.
No refactoring needed.

* [Features](#features)
* [Getting Started](#getting-started)
* [API Reference](https://github.com/concordiajs/concordia/wiki/API)
* [Development](https://github.com/concordiajs/concordia/wiki/Development)
* [More Tags](#more-tags)

## Features

### Focus on writing code - not organising code
Build your application out of actions, small functions with a specific responsibility.
Move your actions about the project as development progresses without having to  wory about having to refactor.
Use namespaces to oranise your actions, and rest save in the knowledge that they will always return a promise.

### Extend it in any way you like
At less than a 100 lines of actual code, the main library is tiny and we aim to keep it that way.
Additional functionality goes into extensions, which you are free to use or not use as you see fit.
Mix Concordia-extensions with your own favourite libraries any way you want.

## Getting Started
Get Concordia from npm.

```js
npm install concordia
```

Then start defining actions.

```js
Concordia = require('concordia');
var concordia = new Concordia();
concordia.defineAction$('number.add', function add(num1, num2) {
    return num1 + num2;
});

Concordia.number.add(3, 6).then(function(result) {
    console.log(result);    //=> 9
});
```

## More tags
[![Code Climate](https://codeclimate.com/github/ConcordiaJS/concordia/badges/gpa.svg)](https://codeclimate.com/github/ConcordiaJS/concordia)
[![Test Coverage](https://codeclimate.com/github/ConcordiaJS/concordia/badges/coverage.svg)](https://codeclimate.com/github/ConcordiaJS/concordia)
[![Dependency Status](https://gemnasium.com/ConcordiaJS/concordia.svg)](https://gemnasium.com/ConcordiaJS/concordia)

We dedicate this Library to the ServiceRegistrar, the EigenServices and the PuppetDresser.
