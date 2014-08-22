//# virgilio.js

// Copyright (C) 2014 IceMobile Agency B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//Bunyan is the logging framework we use.
var bunyan = require('bunyan');
var Promise = require('bluebird');
var util = require('./util');
var errors = require('./errors');
var assert = require('assert');

//## Setup

//Virgilio is meant to be very hackable.
//To prevent accidental overwrites, all internal variables end with a `$`-sign.
var Virgilio = function(options) {
    if (!(this instanceof Virgilio)) {
        return new Virgilio(options);
    }
    this.options$ = options = options || {};
    var logOptions = options.logger || { level: 10, name: 'virgilio' };
    this.log = this.log$ = bunyan.createLogger(logOptions);
    //This will come to contain an array of all loaded modules.
    this.loadedModules$ = {};
    //Keep a reference to this base instance. Usefull when trying to extend it.
    this.baseVirgilio$ = this;
    //Set the path of this (the base virgilio) namespace.
    this.path$ = 'virgilio';
};
//Make virgilio an EventEmitter.
require('util').inherits(Virgilio, require('events').EventEmitter);
//Make the promise library we use available across the application.
Virgilio.prototype.Promise = Promise;
Virgilio.prototype.util$ = util;
//Put all custom errors directly on the prototype.
util.extend(Virgilio.prototype, errors);


//##Base methods

//**loadModule** expects a direct reference to a Virgilio module.
//A Virgilio module is a function, which receives a single options object
//as argument and is bound to a virgilio instance (or namespace).
//A module's name is determined by the functions name.
//Only a single module with a certain name may be loaded.
//There is no limit on the amount of anonymous modules that may be loaded.
Virgilio.prototype.loadModule$ = function(module) {
    if (typeof module !== 'function') {
        throw new this.InvalidModuleError(module);
    }
    var moduleName = this.util$.getFunctionName(module);
    if (this.loadedModules$[moduleName]) {
        //This module is already loaded. Don't load it again.
        this.log$.info('Module `%s` already loaded.', moduleName);
        return this;
    } else if (moduleName) {
        //Save the module name, to prevent it from being loaded again.
        this.log$.info('Loading module: %s', moduleName);
        this.loadedModules$[moduleName] = true;
    }
    module.call(this, this.options$);
    return this;
};

//The handler passed to **defineAction** can be any function.
//This function can return a value or a promise.
Virgilio.prototype.defineAction$ = function(path, handler) {
    var actionName = path.split('.').pop();
    var actionNamespace = this.namespace$(path);
    var action = this.Promise.method(handler.bind(actionNamespace));
    actionNamespace.parent$[actionName] = action;
    actionNamespace.execute$ = action;
    return this;
};


//## Namespaces

//Namespace instances are proxies for the origin virgilio instance.
//The createNamespace$ function creates them and sets their prototype to their
//parent namespace.
var Namespace = function(parent, name) {
    this.path$ = parent.path$ + '.' + name;
    this.parent$ = parent;
    //Create a bunyan childlogger for this namespace,
    //to automatically contextualize all logging.
    this.log = this.log$.child({ context: this.path$ });
};

//**namespace** returns a namespace instance belonging to a path.
//If that namespace doesn't exist, it is created.
Virgilio.prototype.namespace$ = function(path) {
    if (!path) {
        //Return the root virgilio instance.
        return this.baseVirgilio$;
    }
    var namespaceStack = path.split('.').reverse();
    var namespace = this;
    var childNamespace = null;
    var name = null;
    //Get or create each namespace in the path.
    while (namespaceStack.length) {
        name = namespaceStack.pop();
        childNamespace = namespace[name];
        //Check if childNamespace actually is a namespace.
        if (!(childNamespace instanceof Virgilio)) {
            childNamespace = namespace._createNamespace$(name);
        }
        namespace = childNamespace;
    }
    return namespace;
};

//**createNamespace** creates a namespace instance with the provided name in the
//current namespace.
Virgilio.prototype._createNamespace$ = function(name) {
    //Check we're not overwriting an existing property.
    if (this[name]) {
        throw new this.IllegalNamespaceError(this.path$, name);
    }
    //Let the namespace instance inherit virgilio's methods.
    Namespace.prototype = this;
    var namespace = new Namespace(this, name);
    this[name] = namespace;
    return namespace;
};

//**extend** allows users to extend virgilio's default methods.
//It is called with the name of the method to extend and a replacement method.
Virgilio.prototype.extend$ = function(methodName, replacementMethod) {
    //Store a reference to the super method.
    var superMethod = this.baseVirgilio$[methodName];
    this.baseVirgilio$[methodName] = function() {
        var args = Array.prototype.slice.call(arguments);
        replacementMethod.call(this, args, superMethod);
    };
    return this;
};

//## Extension methods

// Add custom errors
Virgilio.prototype.registerError$ = function(error) {
    assert(error && error.name, 'You are trying to register an invalid error');

    var errorName = error.name;
    if (this.baseVirgilio$[errorName]) {
        throw new this.DuplicateErrorRegistrationError(errorName);
    } else {
        this.baseVirgilio$[errorName] = util.createCustomError(error);
    }
};

module.exports = Virgilio;
