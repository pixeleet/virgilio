<a href="https://github.com/icemobilelab/virgilio"><img src="https://raw.githubusercontent.com/icemobilelab/virgilio/master/images/virgilio.png" align="center"  height="300" width="600"/></a>

# Virgilio
[![wercker status](https://app.wercker.com/status/69a7f421e9d59612238df4e8af206558/s/master "wercker status")](https://app.wercker.com/project/bykey/69a7f421e9d59612238df4e8af206558)
[![NPM version](https://badge.fury.io/js/virgilio.svg)](http://badge.fury.io/js/virgilio)

Virgilio is a tiny framework helping you write modular applications.
Start your project in a single file, then scale upwards as needed.
No refactoring needed.

* [Features](#features)
* [Getting Started](#getting-started)
* [Examples](https://github.com/icemobilelab/virgilio/tree/master/examples)
* [API Reference](https://github.com/icemobilelab/virgilio/wiki/API)
* [Development](https://github.com/icemobilelab/virgilio/wiki/Development)
* [More Tags](#more-tags)

## Features

### Focus on writing code - not organising code
Build your application out of actions, small functions with a specific responsibility.
Move your actions about the project as development progresses without having to  wory about having to refactor.
Use namespaces to oranise your actions, and rest save in the knowledge that they will always return a promise.

### Extend it in any way you like
At less than a 100 lines of actual code, the main library is tiny and we aim to keep it that way.
Additional functionality goes into extensions, which you are free to use or not use as you see fit.
Mix Virgilio-extensions with your own favourite libraries any way you want.

## Getting Started
Get Virgilio from npm.

```js
npm install virgilio
```

Then start defining actions.

```js
Virgilio = require('virgilio');
var virgilio = new Virgilio();
virgilio.defineAction$('number.add', function add(num1, num2) {
    return num1 + num2;
});

Virgilio.number.add(3, 6).then(function(result) {
    console.log(result);    //=> 9
});
```

## More tags
[![Code Climate](https://codeclimate.com/github/icemobilelab/virgilio/badges/gpa.svg)](https://codeclimate.com/github/icemobilelab/virgilio)
[![Test Coverage](https://codeclimate.com/github/icemobilelab/virgilio/badges/coverage.svg)](https://codeclimate.com/github/icemobilelab/virgilio)
[![Dependency Status](https://gemnasium.com/icemobilelab/virgilio.svg)](https://gemnasium.com/icemobilelab/virgilio)

We dedicate this Library to the ServiceRegistrar, the EigenServices and the PuppetDresser.
