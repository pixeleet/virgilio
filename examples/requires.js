var Virgilio = require('../');
var virgilio = new Virgilio();
var assert = require('assert');

virgilio.shareRequire$('foo', module.exports.foo = function foo() {
    return 'foo';
});

virgilio.shareRequire$(module.exports.asd = function asd() {
    return 'asd';
});

virgilio.shareRequire$(module.exports.asd = function asd() {
    return 'asd2';
});

var test1 = virgilio.require$.foo();
var test2 = virgilio.require$.asd();

console.log(test1);
console.log(test2);
