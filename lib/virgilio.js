//#virgilio.js

//Bunyan is the logging framework we use.
var bunyan = require('bunyan');
/* eslint-disable no-undef */
var Promise = require('bluebird');
/* eslint-enable */
var util = require('./util');
var errors = require('./errors');
var EventEmitter = require('events').EventEmitter;

//## Setup

//Virgilio is meant to be very hackable.
//To prevent accidental overwrites, all internal variables end with a `$`-sign.
var Virgilio = function Virgilio(options) {
    if (!(this instanceof Virgilio)) {
        return new Virgilio(options);
    }
    EventEmitter.call(this);
    this.options$ = options = options || {};
    this.util$.validateArg('Virgilio', 'options', options, 'object');
    var logOptions = options.logger || {};

    utils.extend({ level: 10, name: 'virgilio' }, logOptions);
    this.log$ = bunyan.createLogger(logOptions);
    //This will come to contain an array of all loaded modules.
    this.loadedModules$ = {};
    //Keep a reference to this base instance. Usefull when trying to extend it.
    this.baseVirgilio$ = this;
    //Set the path of this (the base virgilio) namespace.
    this.path$ = 'virgilio';
    //**requires** allows to distribute to all modules the global requires.
    //In this way we can require modules during initialization and then access
    //to them without requiring them in every submodule.
    this.require$ = {
        bunyan: bunyan,
        bluebird: Promise
    };
};
//Make virgilio an EventEmitter.
require('util').inherits(Virgilio, EventEmitter);
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
Virgilio.prototype.loadModule$ = function loadModule$(module) {
    this.util$.validateArg('loadModule$', 'module', module, 'function');
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
Virgilio.prototype.defineAction$ = function defineAction$(path, handler) {
    if (typeof path === 'function') {
        //We're receiving a named function as single argument.
        handler = path;
        path = handler.name;
    }
    //Check that path is a non-empty string, and handler a function.
    this.util$.validateArg('defineAction$', 'path', path || null, 'string');
    this.util$.validateArg('defineAction$', 'handler', handler, 'function');
    var namespaceStack = path.split('.');
    var actionName = namespaceStack.pop();
    //Get the namespace onto which the action is added.
    var baseNamespace = this.namespace$(namespaceStack.join('.'));
    //Create a new namespace used as a context for the action itself.
    baseNamespace._createAction$(actionName, handler);
    return this;
};

//Create an action on the current namespace.
Virgilio.prototype._createAction$ = function _createAction$(name, handler) {
    //Create a new namespace used as a context for the action itself.
    var actionNamespace = this._createNamespace$(name);
    var boundHandler = handler.bind(actionNamespace);
    var action = null;
    if (handler.constructor.name === 'GeneratorFunction') {
        action = Promise.coroutine(boundHandler);
    }
    else {
        action = this.Promise.method(boundHandler);
    }
    //The action can call itself recursively using `this.execute$()`.
    actionNamespace.execute$ = action;
    //Keep a reference to the action namespace for hacking.
    action.namespace$ = actionNamespace;
    this[name] = action;
    return action;
};


//## Namespaces

//Namespace instances are proxies for the origin virgilio instance.
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
Virgilio.prototype.namespace$ = function namespace$(path) {
    this.util$.validateArg('namespace$', 'path', path, 'string');
    if (!path) {
        //Return the current namespace.
        return this;
    }
    this.util$.validateNamespaceName(path);
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
Virgilio.prototype._getNamespace$ = function _getNamespace$(name) {
    var namespace = this[name];
    var isNamespace = (namespace instanceof Virgilio);
    return isNamespace ? namespace : null;
};

//**_getChildNamespace** returns a namespace instance belonging to a single
//name, but only if that namespace is a direct child of the current namespace.
Virgilio.prototype._getChildNamespace$ = function _getChildNamespace$(name) {
    var namespace = this._getNamespace$(name);
    var isChild = this.hasOwnProperty(name);
    var isChildNamespace = (namespace && isChild);
    return isChildNamespace ? namespace : null;
};

//**createNamespace** creates a namespace instance with the provided name in the
//current namespace.
//If no name is provided, the current namespace will be cloned.
Virgilio.prototype._createNamespace$ = function _createNamespace$(name) {
    //Check we're not overwriting an existing property.
    if (this.hasOwnProperty(name)) {
        throw new this.IllegalNamespaceError(this.path$, name);
    }
    //Let the namespace instance inherit virgilio's methods.
    Namespace.prototype = this;
    var namespace = new Namespace(this, name);
    if (name) {
        this[name] = namespace;
    }
    return namespace;
};

//## Extension methods

//**extend** allows users to extend virgilio's default methods.
//It is called with the name of the method to extend and a replacement method.
Virgilio.prototype.extend$ = function extend$(methodName, replacementMethod) {
    if (typeof methodName === 'function') {
        //We're receiving a named function as single argument.
        replacementMethod = methodName;
        methodName = replacementMethod.name;
    }
    this.util$.validateArg('extend$', 'methodName', methodName || null,
                           'string');
    this.util$.validateArg('extend$', 'replacementMethod', replacementMethod,
                           'function');


    var realMethod = Virgilio.prototype[methodName];
    if (typeof realMethod !== 'function') {
        throw new this.UnexpectedExtensionError(methodName);
    }

    //Store a reference to the super method.
    var superMethod = this[methodName];

    replacementMethod.super$ = superMethod;
    this[methodName] = replacementMethod;
    return this;
};

//**shareRequire$** add a provided required package to the virgilio's requires
Virgilio.prototype.shareRequire$ = function shareRequire(name, package) {
    if (typeof name === 'function') {
        //We're receiving a named function as single argument.
        package = name;
        name = package.name;
    }
    
    this.util$.validateArg('shareRequire$', 'name', name || null, 'string');
    this.util$.validateArg('shareRequire$', 'package', package , 'function');

    if (typeof package === 'function' || typeof package === 'object') {
        var sharedPackage = this.require$[name];

        if (sharedPackage)
            this.baseVirgilio$.log$.info('Module %s is already registered',
                                         name);
        this.require$[name] = sharedPackage || package;
    }
};

//Add custom errors
Virgilio.prototype.registerError$ = function registerError$(name, init) {
    if (typeof name === 'function') {
        init = name;
        name = init.name;
    }
    this.util$.validateArg('registerError$', 'name', name || null, 'string');
    this.util$.validateArg('registerError$', 'init', init,
                           ['function', 'undefined']);
    if (this.baseVirgilio$[name]) {
        throw new this.DuplicateErrorRegistrationError(name);
    }
    this.baseVirgilio$[name] = util.createCustomError(name, init);
};

module.exports = Virgilio;
//Make the libraries we use available externally.
Virgilio.bluebird = Promise;
Virgilio.bunyan = bunyan;
