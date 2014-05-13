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

/*
 * Mediator
 * This can be used as a proxy for any messaging bus you like to use.
 * Virgilio expects the mediator to implement a request and
 * a registerHandler method.
 *
 * Below is a placeholder that is not meant for production use.
 * Replace it with a good library.
 */
var Mediator = function(virgilio) {
    this.virgilio = virgilio;
    this.handlers = {};
};

Mediator.prototype.registerHandler = function(topic, handler) {
    this.handlers[topic] = handler;
};

Mediator.prototype.request = function(topic, args) {
    var Promise = this.virgilio.Promise;
    var this_ = this;
    return new Promise(function(resolve, reject) {
        var handler = this_.handlers[topic];
        if (!handler) {
            var error = new this_.virgilio.NotAnActionError(topic);
            this_.virgilio.log$.warn(error);
            reject(error);
        }
        var response = handler.apply(null, args);
        resolve(response);
    });
};

module.exports = Mediator;
