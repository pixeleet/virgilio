var Virgilio = require('../');
var virgilio = new Virgilio();
var assert = require('assert');

virgilio.shareRequire$('foo', module.exports.foo = function foo() {
    return 'foo';
});

virgilio.shareRequire$(module.exports.asd = function asd() {
    return 'asd';
});

var test1 = virgilio.require$.foo();
var test2 = virgilio.require$.asd();

assert(test1 === 'foo');
assert(test2 === 'asd');
