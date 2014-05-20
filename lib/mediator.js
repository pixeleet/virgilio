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

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var uuid = require('node-uuid').v4;

/*
 * Mediator
 * This can be used as a proxy for any messaging bus you like to use.
 * Virgilio expects the mediator to implement a request, publish and
 * a registerHandler method.
 */
var Mediator = function(virgilio) {
    this.virgilio = virgilio;
    this.eventEmitter = new EventEmitter();
};

Mediator.prototype.registerHandler = function(topic, action) {
    var handler = this._createEventHandler(action);
    this.eventEmitter.on(topic, handler);
};

Mediator.prototype.publish = function(topic, args, replyTopic) {
    this.eventEmitter.emit(topic, args, replyTopic);
};

Mediator.prototype.request = function(topic, args) {
    var Promise = this.virgilio.Promise;
    var deferred = Promise.defer();
    var replyTopic = uuid();
    //The reply args are (err, res), so identical to the node callback format.
    //That's why we can directly supply deferred.callback as a listener here.
    this.eventEmitter.once(replyTopic, deferred.callback);
    //Now that we're ready for the reply, submit our request.
    this.publish(topic, args, replyTopic);
    //If no reply comes back, most likely nobody was listening.
    var timeoutMessage = util.format(
            'No response. Are you sure this action exists: %s', topic);
    return deferred.promise.timeout(100, timeoutMessage);
};

Mediator.prototype._createEventHandler = function(action) {
    return function(args, replyTopic) {
        var mediator = this;
        var Promise = mediator.virgilio.Promise;
        var result = Promise.try(function() {
            //If the action throws, Promise.try will return a rejected promise.
            return action.apply(null, args);
        });
        //If no reply is expected, we can stop here.
        if (!replyTopic) { return; }
        result.nodeify(function(error, response) {
            //If no response is returned and no error set, this action is a
            //passive listener. We do not want to reply in that case.
            //Actions that want to return an empty value should return null.
            if (response === undefined && !error) { return; }
            this.eventEmitter.emit(replyTopic, error, response);
        }.bind(this));
    }.bind(this);
};

module.exports = Mediator;
