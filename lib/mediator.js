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
var stream = require('stream');
var util = require('util');
var uuid = require('node-uuid').v4;

/*
 * Mediator
 */
var Mediator = function(virgilio) {
    this.timeout = virgilio.options$.timeout || 1000;
    this.virgilio = virgilio;
    this.eventEmitter = new EventEmitter();
    this.stream =  stream.PassThrough({ objectMode: true });
    getMessage(this);
};

//getMessage polls the stream for new messages whenever the I/O queue is clear.
function getMessage (mediator) {
    var message = mediator.stream.read();
    setImmediate(getMessage, mediator);
    if (!message) { return; }
    mediator.eventEmitter.emit(message.topic, message.args, message.replyTopic);
}

Mediator.prototype.registerHandler = function(topic, action, observer) {
    var handler = this._createEventHandler(action);
    //Actions that are observers do not return values.
    handler.observer = observer;
    this.eventEmitter.on(topic, handler);
};

Mediator.prototype.publish = function(topic, args, replyTopic) {
    this.stream.write({
        topic: topic,
        args: args,
        replyTopic: replyTopic
    });
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
    //Create an error instance the promise is rejected with, if it times out.
    var timeoutError = this._createTimeoutError(topic, this.timeout);
    this._addTimeoutToPromise(deferred, this.timeout, timeoutError);
    //If this promise returns an error, because of a timeout or because it is
    //cancelled, unregister the event listener.
    var _this = this;
    deferred.promise.catch(function() {
        _this.eventEmitter.removeAllListeners(replyTopic);
    });
    return deferred.promise.cancellable();
};

Mediator.prototype._createEventHandler = function(action) {
    //The closure below leaks the action argument, but we need it
    //during the running time of the application anyway, so we don't care.
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
            //An action marked as observer doesn't return a value.
            if (action.observer) { return; }
            this.eventEmitter.emit(replyTopic, error, response);
        }.bind(this));
    }.bind(this);
};

Mediator.prototype._createTimeoutError = function(topic, timeout) {
    var Promise = this.virgilio.Promise;
    var timeoutMessage = util.format(
        'No response after %s ms. Are you sure this action exists: %s',
        timeout,
        topic
    );
    return new Promise.TimeoutError(timeoutMessage);
};

Mediator.prototype._addTimeoutToPromise =
            function(deferred, timeout, timeoutError) {
    var promise = deferred.promise;
    promise.withTimeout = withTimeout.bind(deferred);
    promise.withTimeout(timeout, timeoutError);
    return promise;
};

//The withTimeot function is meant to be added as a promise instance method.
function withTimeout(timeout, timeoutError) {
    var deferred = this;
    deferred.timeoutError = timeoutError || deferred.timeoutError;
    //If a timeout is already set, clear it.
    if (deferred.timeout) {
        clearTimeout(deferred.timeout);
    }
    deferred.timeout = setTimeout(function(deferred) {
        deferred.reject(deferred.timeoutError);
    }, timeout, deferred);
    return deferred.promise;
}

module.exports = Mediator;
