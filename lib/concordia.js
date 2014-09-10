//# concordia.js

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
var EventEmitter = require('events').EventEmitter;

//## Setup

//Concordia is meant to be very hackable.
//To prevent accidental overwrites, all internal variables end with a `$`-sign.
var Concordia = function Concordia(options) {
    if (!(this instanceof Concordia)) {
        return new Concordia(options);
    }
    EventEmitter.call(this);
    this.options$ = options = options || {};
    var logOptions = options.logger || { level: 10, name: 'concordia' };
    this.log$ = bunyan.createLogger(logOptions);
    //This will come to contain an array of all loaded modules.
    this.loadedModules$ = {};
    //Keep a reference to this base instance. Usefull when trying to extend it.
    this.baseConcordia$ = this;
    //Set the path of this (the base concordia) namespace.
    this.path$ = 'concordia';
};
//Make concordia an EventEmitter.
require('util').inherits(Concordia, EventEmitter);
//Make the promise library we use available across the application.
Concordia.prototype.Promise = Promise;
Concordia.prototype.util$ = util;
//Put all custom errors directly on the prototype.
util.extend(Concordia.prototype, errors);


//##Base methods

//**loadModule** expects a direct reference to a Concordia module.
//A Concordia module is a function, which receives a single options object
//as argument and is bound to a concordia instance (or namespace).
//A module's name is determined by the functions name.
//Only a single module with a certain name may be loaded.
//There is no limit on the amount of anonymous modules that may be loaded.
Concordia.prototype.loadModule$ = function loadModule$(module) {
    if (typeof module !== 'function') {
        throw new this.InvalidModuleError(module);
    }
    var moduleName = module.name;
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
Concordia.prototype.defineAction$ = function defineAction$(path, handler) {
    assert(typeof path === 'string', 'Path must be a string.');
    assert(typeof handler === 'function', 'Handler must be a function.');
    var namespaceStack = path.split('.');
    var actionName = namespaceStack.pop();
    //Get the namespace onto which the action is added.
    var baseNamespace = this.namespace$(namespaceStack.join('.'));
    //Create a new namespace used as a context for the action itself.
    baseNamespace._createAction$(actionName, handler);
    return this;
};

//Create an action on the current namespace.
Concordia.prototype._createAction$ = function _createAction$(name, handler) {
    //Create a new namespace used as a context for the action itself.
    var actionNamespace = this._createNamespace$(name);
    var action = this.Promise.method(handler.bind(actionNamespace));
    //The action can call itself recursively using `this.execute$()`.
    actionNamespace.execute$ = action;
    //Keep a reference to the action namespace for hacking.
    action.namespace$ = actionNamespace;
    this[name] = action;
    return action;
};


//## Namespaces

//Namespace instances are proxies for the origin concordia instance.
//The createNamespace$ function creates them and sets their prototype to their
//parent namespace.
var Namespace = function Namespace(parent, name) {
    this.path$ = parent.path$ + (name ? ('.' + name) : '');
    this.parent$ = parent;
    //Create a bunyan childlogger for this namespace,
    //to automatically contextualize all logging.
    this.log$ = this.log$.child({ context: this.path$ });
};

//**namespace** returns a namespace instance belonging to a path.
//If that namespace doesn't exist, it is created.
Concordia.prototype.namespace$ = function namespace$(path) {
    if (!path) {
        //Return the current namespace.
        return this;
    }
    var namespaceStack = path.split('.').reverse();
    //Get the head of the namespace stack. This is not always a child of `this`.
    var name = namespaceStack.pop();
    var namespace = this._getNamespace$(name) || this._createNamespace$(name);
    //Follow the namespace stack, each element a child of the previous element.
    while ((name = namespaceStack.pop())) {
        namespace = namespace._getChildNamespace$(name) ||
                                    namespace._createNamespace$(name);
    }
    return namespace;
};

//**_getNamespace** returns a namespace instance belonging to a single name.
Concordia.prototype._getNamespace$ = function _getNamespace$(name) {
    var namespace = this[name];
    var isNamespace = (namespace instanceof Concordia);
    return isNamespace ? namespace : null;
};

//**_getChildNamespace** returns a namespace instance belonging to a single
//name, but only if that namespace is a direct child of the current namespace.
Concordia.prototype._getChildNamespace$ = function _getChildNamespace$(name) {
    var namespace = this._getNamespace$(name);
    var isChild = this.hasOwnProperty(name);
    var isChildNamespace = (namespace && isChild);
    return isChildNamespace ? namespace : null;
};

//**createNamespace** creates a namespace instance with the provided name in the
//current namespace.
//If no name is provided, the current namespace will be cloned.
Concordia.prototype._createNamespace$ = function _createNamespace$(name) {
    //Check we're not overwriting an existing property.
    if (this.hasOwnProperty(name)) {
        throw new this.IllegalNamespaceError(this.path$, name);
    }
    //Let the namespace instance inherit concordia's methods.
    Namespace.prototype = this;
    var namespace = new Namespace(this, name);
    if (name) {
        this[name] = namespace;
    }
    return namespace;
};

//## Extension methods

//**extend** allows users to extend concordia's default methods.
//It is called with the name of the method to extend and a replacement method.
Concordia.prototype.extend$ = function extend$(methodName, replacementMethod) {
    //Store a reference to the super method.
    var superMethod = this.baseConcordia$[methodName];
    var namespace = this._createNamespace$();
    namespace.super$ = superMethod && superMethod.bind(this);
    this[methodName] = replacementMethod.bind(namespace);
    return this;
};

// Add custom errors
Concordia.prototype.registerError$ = function registerError$(error) {
    assert(error && error.name, 'You are trying to register an invalid error');
    var errorName = error.name;
    if (this.baseConcordia$[errorName]) {
        throw new this.DuplicateErrorRegistrationError(errorName);
    }
    this.baseConcordia$[errorName] = util.createCustomError(error);
};

module.exports = Concordia;
