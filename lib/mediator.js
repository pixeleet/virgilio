//# mediator.js

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
var Duplex = require('stream').Duplex;
var util = require('util');
var uuid = require('node-uuid').v4;
var Promise = require('bluebird');

//The mediator extends the duplex stream interface. Messages can be piped
//directly to the mediator and are streamed from it.
//This makes it easy to use multiple mediators together.
var Mediator = function(options) {
    //Call the constructor of the Duplex Stream.
    Duplex.call(this, { objectMode: true });
    this.timeout = options.timeout || 1000;
    //Incoming messages are distributed to listerens using an eventEmitter.
    this.eventEmitter = new EventEmitter();
};
util.inherits(Mediator, Duplex);

//Duplex Streams need a `_read` method. Ours is a no-op because we never.
//actively read. Incoming messages are direclty pushed into the stream.
Mediator.prototype._read = function() {};

//Duplex Streams also need a `_write` method. Ours pushes a message to
//the eventEmitter and then queues the next write at the end of the callstack.
Mediator.prototype._write = function(message, encoding, callback) {
    var eventEmitter = this.eventEmitter;
    eventEmitter.emit.apply(eventEmitter, message);
    //Wait for the I/O queue to clear, before accepting the next write.
    setImmediate(callback);
};

Mediator.prototype.registerHandler = function(topic, action, observer) {
    var handler = this._createEventHandler(action);
    //If the action is an observer, mark the handler.
    handler.observer = observer;
    this.eventEmitter.on(topic, handler);
};

//**publish** pushes a message into the queue.
//It takes the same arguments as `EventEmitter.emit()`.
Mediator.prototype.publish = function(/** topic, args, ... **/) {
    var args = Array.prototype.slice.apply(arguments);
    this.push(args);
};

//**request** publishes a message and waits for a response.
Mediator.prototype.request = function(topic, args) {
    var deferred = Promise.defer();
    var replyTopic = uuid();
    //The reply args are (err, res), so identical to the node callback format.
    //That's why we can directly supply deferred.callback as a listener here.
    this.eventEmitter.once(replyTopic, deferred.callback);
    //Now that we're ready for the reply, submit our request.
    this.publish(topic, args, replyTopic);
    this._addTimeoutToPromise(deferred, {
        timeout: this.timeout,
        topic: topic,
        TimeoutError: Promise.TimeoutError
    });
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
        var result = Promise.try(function() {
            //If the action throws, Promise.try will return a rejected promise.
            return action.apply(null, args);
        });
        //If no reply is expected, or if we are an observer, we can stop here.
        if (!replyTopic || action.observer) { return; }
        result.nodeify(function(error, response) {
            this.publish(replyTopic, error, response);
        }.bind(this));
    }.bind(this);
};

Mediator.prototype._addTimeoutToPromise = function(deferred, options) {
    var promise = deferred.promise;
    deferred.topic = options.topic;
    deferred.TimeoutError = options.TimeoutError;
    //Add withTimeout method to allow the promise receiver to change it.
    promise.withTimeout = withTimeout.bind(deferred);
    //Call withTimeout now to set the default timeout.
    promise.withTimeout(options.timeout);
    return promise;
};

//The withTimeot function is meant to be added as a promise instance method.
function withTimeout(timeout) {
    var deferred = this;
    //If a timeout is already set, clear it.
    if (deferred.timeout) {
        clearTimeout(deferred.timeout);
    }
    deferred.timeout = setTimeout(throwTimeout, timeout, deferred, timeout);
    return deferred.promise;
}

function throwTimeout(deferred, timeout) {
    var timeoutMessage = util.format(
        'No response after %s ms. Are you sure this action exists: %s',
        timeout,
        deferred.topic
    );
    deferred.reject(new deferred.TimeoutError(timeoutMessage));
}

module.exports = Mediator;
