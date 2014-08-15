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
var util = require('./util');
var Mediator = require('./mediator');
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
    var passThrough = (this.options$.passThrough === false) ? false : true;
    this.log = this.log$ = bunyan.createLogger(logOptions);
    //This will come to contain a map of namespace instances, indexed by name.
    this.namespaces$ = {};
    //This will come to contain an array of all loaded modules.
    this.loadedModules$ = {};
    //Keep a reference to this base instance. Usefull when trying to extend it.
    this.baseVirgilio$ = this;
    var mediator = this.mediator$ = new Mediator(options);
    if (passThrough) {
        mediator.pipe(mediator);
    }
};

//Make the promise library we use available across the application.
Virgilio.prototype.Promise = require('bluebird');
Virgilio.prototype.util = util;
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
    var moduleName = this.util.getFunctionName(module);
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
//It must return a value or a promise.
Virgilio.prototype.defineAction$ = function(path, handler, observer) {
    //This method might be called from a namespace instance,
    //the provided path being relative to that namespace.
    var fullPath = this.fullPath$(path);
    var type = observer ? 'subscriber' : 'action';
    this.log$.info('Registering %s: %s', type, fullPath);
    //Bind the action handler to its own personal namespace.
    var namespace = this.namespace$(path);
    handler = handler.bind(namespace);
    this.mediator$.registerHandler(fullPath, handler, observer);
    return this;
};

//**subscribe** is like defineAction, except a subscriber does not return
//a value.
Virgilio.prototype.subscribe$ = function(path, handler) {
    return this.defineAction$(path, handler, true);
};

//All arguments passed to **execute**, besides the first,
//are passed on the action handler.
Virgilio.prototype.execute$ = function(path /*, arguments */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var fullPath = this.fullPath$(path);
    this.log$.trace('Executing action: %s', fullPath);
    return this.mediator$.request(fullPath, args);
};

//**publish** is like execute, except it doesn't expect a response.
Virgilio.prototype.publish$ = function(path /*, arguments */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var fullPath = this.fullPath$(path);
    this.log$.trace('Publishing to an action: %s', fullPath);
    this.mediator$.publish(fullPath, args);
    return this;
};

//## Namespaces

//**namespace** returns a namespace instance belonging to a path.
//If that namespace doesn't exist, it is created.
//Namespace instances are proxies for the origin virgilio instance.
Virgilio.prototype.namespace$ = function(path) {
    if (!path) {
        //Return the root virgilio instance.
        return this.baseVirgilio$;
    }
    var fullPath = this.fullPath$(path);
    var namespace = this.namespaces$[fullPath];
    if (!namespace) {
        namespace = this.createNamespace$(fullPath);
    }
    return namespace;
};

//**createNamespace** creates a namespace instance for a supplied path.
Virgilio.prototype.createNamespace$ = function(path) {
    var fullPath = this.fullPath$(path);
    var Namespace = function(base, fullPath) {
        this.path$ = fullPath;
        //Create a bunyan childlogger for this namespace,
        //to automatically contextualize all logging.
        this.log = this.log$.child({ context: this.path$ });
    };
    //Let the namespace instance inherit virgilio's methods.
    Namespace.prototype = this.namespace$(this.basePath$(path));
    var namespace = new Namespace(this, fullPath);
    //Store a reference to the namespace, so we can access it later.
    this.baseVirgilio$.namespaces$[path] = namespace;
    return namespace;
};

//**fullPath** takes a path and combines it with the path of the
//namespace it is called from, to generate a full path.
Virgilio.prototype.fullPath$ = function(path) {
    if (typeof path !== 'string') {
        throw new this.InvalidPathError(path);
    }
    //If the path already is an existing fullPath, simply return it.
    if (this.baseVirgilio$.namespaces$[path]) {
        return path;
    }
    //Get the path to the current namespace (the one `this` refers to).
    var basePath = this.path$;
    var fullPath = this.joinPaths$(basePath, path);
    return fullPath;
};

//**joinPaths** takes two paths, and joins them into one.
Virgilio.prototype.joinPaths$ = function(basePath, relPath) {
    basePath = basePath ? basePath.split('.') : [];
    relPath = relPath ? relPath.split('.') : [];
    var firstName = relPath[0];
    var fullPath = [];
    //Add all the elements of `basePath` up to the first element of `relPath`.
    for (var i = 0, len = basePath.length; i < len; i++) {
        var name = basePath[i];
        if (name === firstName) { break; }
        fullPath.push(name);
    }
    //Add to that all elements of `relPath`.
    return fullPath.concat(relPath).join('.');
};

//**basePath** takes a path and returns the basePath.
//```basePath('one.two.three') -> 'one.two'.```
Virgilio.prototype.basePath$ = function(path) {
    path = path.split('.');
    path.pop();
    return path.join('.');
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

//Set up Virgilio's public interface.
Virgilio.prototype.loadModule = Virgilio.prototype.loadModule$;
Virgilio.prototype.namespace = Virgilio.prototype.namespace$;
Virgilio.prototype.defineAction = Virgilio.prototype.defineAction$;
Virgilio.prototype.subscribe = Virgilio.prototype.subscribe$;
Virgilio.prototype.execute = Virgilio.prototype.execute$;
Virgilio.prototype.publish = Virgilio.prototype.publish$;
Virgilio.prototype.extend = Virgilio.prototype.extend$;

module.exports = Virgilio;
