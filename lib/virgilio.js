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
var Mediator = require('./mediator');

//## Setup

//Virgilio is meant to be very hackable.
//To prevent accidental overwrites, all internal variables end with a `$`-sign.
var Virgilio = function(options) {
    if (!(this instanceof Virgilio)) {
        return new Virgilio(options);
    }
    this.options$ = options || {};
    this.mediator$ = new Mediator(this);
    var logOptions = this.options$.logger || { level: 10, name: 'virgilio' };
    this.log$ = bunyan.createLogger(logOptions);
    //This will come to contain a map of namespace instances, indexed by name.
    this.namespaces$ = {};
    //Keep a reference to this base instance. Usefull when trying to extend it.
    this.baseVirgilio$ = this;
};

//Make the promise library we use available across the application.
Virgilio.prototype.Promise = require('bluebird');

//##Base methods

//**use** loads a Virgilio extension (an npm package).
//Structurally, an extension is just an ordinary Virgilio module.
Virgilio.prototype.use$ = function(moduleName) {
    var module = null;
    //All extensions should have a name starting with `virgilio-`.
    moduleName = 'virgilio-' + moduleName;
    try {
        module = require(moduleName);
    }
    catch(err) {
        this.log$.error('Could not load module: %s', moduleName);
        throw err;
    }
    return this.loadModule$(module);
};

//**loadModule** expects a direct reference to a Virgilio module.
//A Virgilio module is a function, which receives a single options object
//as argument and is bound to a virgilio instance (or namespace).
Virgilio.prototype.loadModule$ = function(module) {
    module.call(this, this.options$);
    return this;
};

//The handler passed to **defineAction** can be any function.
//It must return a value or a promise.
Virgilio.prototype.defineAction$ = function(path, handler) {
    //This method might be called from a namespace instance,
    //the provided path being relative to that namespace.
    var fullPath = this.fullPath$(path);
    this.log$.info('Registering action: %s', fullPath);
    //Bind the action handler to its own personal namespace.
    var namespace = this.namespace$(path);
    handler = handler.bind(namespace);
    this.mediator$.registerHandler(fullPath, handler);
    return this;
};

//All arguments passed to **execute**, besides the first,
//are passed on the action handler.
Virgilio.prototype.execute$ = function(path /*, arguments */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var fullPath = this.fullPath$(path);
    this.log$.trace('Executing action: %s', fullPath);
    return this.mediator$.request(fullPath, args);
};

//## Namespaces

//Namespace instances are proxies for the origin virgilio instance.
//Their `context$` property is an array representation of their path.
//For instance, a namespace with path `foo.bar` has `context$ = ['foo', 'bar']`
Virgilio.prototype.context$ = [];

//**namespace** returns a namespace instance belonging to a path.
//If that namespace doesn't exist, it is created.
Virgilio.prototype.namespace$ = function(path) {
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
        this.context$ = fullPath.split('.');
        //Create a bunyan childlogger for this namespace,
        //to automatically contextualize all logging.
        this.log = this.log$.child({ context: this.context$ });
    };
    //Let the namespace instance inherit virgilio's methods.
    Namespace.prototype = this.baseVirgilio$;
    var namespace = new Namespace(this, fullPath);
    //Make the namespace accesible by other parts of the application.
    this.baseVirgilio$.namespaces$[path] = namespace;
    return namespace;
};

//**fullPath** takes a path and combines it with the context of the
//namespace it is called from, to generate a full path.
Virgilio.prototype.fullPath$ = function(path) {
    if (typeof path !== 'string') {
        throw new Error('Invalid path: ' + path);
    }
    //If the path already is an existing fullPath, simply return it.
    if (this.baseVirgilio$.namespaces$[path]) {
        return path;
    }
    //Get the path to the current namespace (the one `this` refers to).
    var basePath = this.context$;
    var relPath = path.split('.');
    var fullPath = this.joinPaths$(basePath, relPath);
    return fullPath.join('.');
};

//**joinPaths** takes two paths in array form, and joins them into one.
Virgilio.prototype.joinPaths$ = function(basePath, relPath) {
    var firstName = relPath[0];
    var fullPath = [];
    //Add all the elements of `basePath` up to the first element of `relPath`.
    for (var i = 0, len = basePath.length; i < len; i++) {
        var name = basePath[i];
        if (name === firstName) { break; }
        fullPath.push(name);
    }
    //Add to that all elements of `relPath`.
    return fullPath.concat(relPath);
};

//Set up Virgilio's public interface.
Virgilio.prototype.use = Virgilio.prototype.use$;
Virgilio.prototype.loadModule = Virgilio.prototype.loadModule$;
Virgilio.prototype.namespace = Virgilio.prototype.namespace$;
Virgilio.prototype.defineAction = Virgilio.prototype.defineAction$;
Virgilio.prototype.execute = Virgilio.prototype.execute$;

module.exports = Virgilio;
