var bunyan = require('bunyan');
var Mediator = require('./mediator');

var Virgilio = function(options) {
    if (!(this instanceof Virgilio)) {
        return new Virgilio(options);
    }
    this.options$ = options || {};
    this.mediator$ = new Mediator(this);
    var logOptions = this.options$.logger || { level: 10, name: 'virgilio' };
    this.log$ = bunyan.createLogger(logOptions);
    this.namespaces$ = {};
    this.baseVirgilio$ = this;
};

Virgilio.prototype.context$ = [];

//Make the Promise library we use easily accesible, to encourage the use
//of the same library across the application.
Virgilio.prototype.Promise = require('bluebird');

/**
 * @param {String/Function} module
 * A requirable string or direct reference to a Virgilio module.
 */
Virgilio.prototype.use$ = function(module) {
    if (typeof module === 'string') {
        try {
            module = require(module);
        }
        catch(err) {
            this.log$.error('Could not load module: %s', module);
            throw err;
        }
    }
    module.call(this, this.options$);
    return this;
};

Virgilio.prototype.defineAction$ = function(path, handler) {
    var namespace = this.namespace$(path);
    var fullPath = this.fullPath$(path);
    this.log$.info('Registering action: %s', fullPath);
    handler = handler.bind(namespace);
    this.mediator$.registerHandler(fullPath, handler);
    return this;
};

Virgilio.prototype.execute$ = function(path /*, arguments */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var fullPath = this.fullPath$(path);
    this.log$.trace('Executing action: %s', fullPath);
    return this.mediator$.request(fullPath, args);
};

Virgilio.prototype.namespace$ = function(path) {
    var fullPath = this.fullPath$(path);
    var namespace = this.namespaces$[fullPath];
    if (!namespace) {
        namespace = this.createNamespace$(fullPath);
    }
    return namespace;
};

Virgilio.prototype.createNamespace$ = function(path) {
    var fullPath = this.fullPath$(path);
    var Namespace = function(base, fullPath) {
        this.context$ = fullPath.split('.');
        this.log = this.log$.child({ context: this.context$ });
    };
    Namespace.prototype = this.baseVirgilio$;
    var namespace = new Namespace(this, fullPath);
    this.namespaces$[path] = namespace;
    return namespace;
};

Virgilio.prototype.fullPath$ = function(path) {
    if (typeof path !== 'string') {
        throw new Error('Invalid path: ' + path);
    }
    //Check if it's an existing root path.
    if (this.namespaces$[path]) {
        return path;
    }
    var basePath = this.context$;
    var relPath = path.split('.');
    var fullPath = this.mergePaths$(basePath, relPath);
    return fullPath.join('.');
};

// Merge two paths (arrays) in the following manner:
// [a, b, c] + [b, d, e] -> [a, b, d, e]
Virgilio.prototype.mergePaths$ = function(basePath, relPath) {
    var firstName = relPath[0];
    var context = this.context$;
    var fullPath = [];
    for (var i = 0, len = context.length; i < len; i++) {
        var name = context[i];
        if (name === firstName) { break; }
        fullPath.push(name);
    }
    return fullPath.concat(relPath);
};

Virgilio.prototype.use = Virgilio.prototype.use$;
Virgilio.prototype.loadModule = Virgilio.prototype.use$;
Virgilio.prototype.namespace = Virgilio.prototype.namespace$;
Virgilio.prototype.defineAction = Virgilio.prototype.defineAction$;
Virgilio.prototype.execute = Virgilio.prototype.execute$;

module.exports = Virgilio;
