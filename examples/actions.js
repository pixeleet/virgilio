var Virgilio = require('../');
var virgilio = new Virgilio();
var FRUITS = [ 'apple', 'pear', 'banana', 'melon' ];

//Defining an action.
virgilio.defineAction$(function getFruit(fruitId) {
    var fruit = FRUITS[fruitId];
    if (!fruit) {
        throw new Error('404 fruit not found');
    }
    return FRUITS[fruitId];
});

//Calling an action.
virgilio.getFruit(0)
    .then(function(result) {
        console.log(result);    //=> 'apple'
    });

//Calling an action that throws an error results in a rejected promise.
virgilio.getFruit(100)
    .catch(function(err) {
        console.log(err.message);   //=> '404 fruit not found'
    });
