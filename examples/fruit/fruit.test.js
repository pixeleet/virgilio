//TODO: convert and expand these into a nice mocha test-suite.
var virgilio = require('./');
var assert = require('assert');

virgilio.namespace('fruit').execute('fruit.findAll')
    .then(function(fruits) {
        assert.deepEqual(
            fruits.sort(),
            [ 'apple', 'banana', 'melon', 'pear' ]
        );
    }).done();


virgilio.execute('salad.getRandom')
    .then(function(salad) {
        assert(salad);
    }).done();


var exceptionCaught = null;
virgilio.execute('fruit.delete', 'ananas')
.catch(function() {
    exceptionCaught = true;
})
.finally(function() {
    assert(
        exceptionCaught,
        'an error thrown by a service should result in a rejected promise.');
}).done();


var exceptionCaught = null;
virgilio.execute('fruit.eat', 'apple')
.catch(function() {
    exceptionCaught = true;
})
.finally(function() {
    assert(
        exceptionCaught,
        'calling a non-existing service should return a rejected promise.');
}).done();

module.exports = virgilio;
