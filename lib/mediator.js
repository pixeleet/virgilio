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
            reject('Service does not exist: ' + topic);
        }
        var response = handler.apply(null, args);
        resolve(response);
    });
};

module.exports = Mediator;
