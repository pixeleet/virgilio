var Concordia = require('../');
var concordia = new Concordia();
var FRUITS = [ 'apple', 'pear', 'banana', 'melon' ];

//Defining an action.
concordia.defineAction$('getFruit', function(fruitId) {
    if (fruitId >= FRUITS.length) {
        throw new Error('404 fruit not found');
    }
    return FRUITS[fruitId];
});

//Calling an action.
concordia.getFruit(0)
    .then(function(result) {
        console.log(result);    //=> 'apple'
    });

//Calling an action that throws an error results in a rejected promise.
concordia.getFruit(100)
    .catch(function(err) {
        console.log(err.message);   //=> '404 fruit not found'
    });
