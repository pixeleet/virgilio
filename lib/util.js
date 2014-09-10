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

//**createCustomError** returns the constructor for a custom error type, defined
//by a properties object.
function createCustomError(properties) {
    var CustomError = function(message) {
        extend(this, properties);
        Error.call(this);
        Error.captureStackTrace(this, this.name);
        if (this.init) {
            this.init.apply(this, arguments);
        } else if (message) {
            this.message = message;
        }
    };
    CustomError.prototype = new Error();
    return CustomError;
}

module.exports.extend = extend;
module.exports.createCustomError = createCustomError;
