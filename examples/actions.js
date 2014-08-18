suite('Actions');
var Virgilio = require('../');
var config = require('./testConfig.json');
var virgilio = new Virgilio(config);
var FRUITS = [ 'apple', 'pear', 'banana', 'melon' ];

test('Defining an action', function() {
    virgilio.defineAction$('getFruit', function(fruitId) {
        if (fruitId >= FRUITS.length) {
            throw new Error('404 fruit not found');
        }
        return FRUITS[fruitId];
    });
});

test('Calling an action', function(done) {
    virgilio.getFruit(0)
        .then(function(result) {
            result.must.equal('apple');
            done();
        });
});

test('Calling an action and getting an error', function(done) {
    virgilio.getFruit(100)
        .catch(function(err) {
            err.message.must.equal('404 fruit not found');
            done();
        });
});
