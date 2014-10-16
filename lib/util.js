var assert = require('assert');
var util = require('util');

//**extend** shallowly extends a base object with the properties of one or
//more other objects. Inspired by underscore.
function extend(obj /*, obj2, obj3, ... */) {
    var extensions = Array.prototype.slice.call(arguments, 1);
    extensions.forEach(function(extension) {
        var properties = Object.keys(extension);
        properties.forEach(function(property) {
            obj[property] = extension[property];
        });
    });
    return obj;
}

//**createCustomError** returns the constructor for a custom error type.
function createCustomError(name, init) {
    assert(name, 'You are trying to register an invalid error');
    var CustomError = function() {
        Error.call(this);
        Error.captureStackTrace(this, CustomError);
        this.name = name;
        if (init) {
            init.apply(this, arguments);
        } else {
            this.message = arguments[0];
        }
    };
    util.inherits(CustomError, Error);
    return CustomError;
}

var InvalidArgumentsError = createCustomError(
    'InvalidArgumentsError',
    function(method, argName, argType) {
        var message = [
            '%s() called with invalid arguments.',
            '%s should be a %s.'
        ].join(' ');
        argType = util.isArray(argType) ? argType.join('/') : argType;
        this.message = util.format(message, method, argName, argType);
    }
);

function validateArg(methodName, argName, arg, types) {
    if (!util.isArray(types)) {
        types = [types];
    }
    if (types.indexOf(typeof arg) === -1) {
        var error = new InvalidArgumentsError(methodName, argName, types);
        throw error;
    }
}


exports.extend = extend;
exports.createCustomError = createCustomError;
exports.validateArg = validateArg;
