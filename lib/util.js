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
        this.stack = (new Error()).stack;
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
            'InvalidArgumentsError', function(method, argName, argType) {
    var message = [
        '%s() called with invalid arguments.',
        '%s should be a %s'
    ].join(' ');
    this.message = util.format(message, method, argName, argType);
});

function validateArg(methodName, argName, arg, types) {
    if (!util.isArray(types)) {
        types = [types];
    }
    if (types.indexOf(typeof arg) === -1) {
        throw new InvalidArgumentsError(methodName, argName, types);
    }
}


exports.extend = extend;
exports.createCustomError = createCustomError;
exports.validateArg = validateArg;
