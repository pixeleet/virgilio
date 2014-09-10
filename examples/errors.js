var Concordia = require('../');
var concordia = new Concordia();

//Defining a simple error.
concordia.registerError$({
    name: 'FooError'
});
var fooError = new concordia.FooError('foo!');
console.log(fooError.name);     //=> 'FooError'
console.log(fooError.message);  //=> 'foo!'

//Defining an error with a custom constructor.
concordia.registerError$({
    name: 'DivideByZeroError',
    init: function(number) {
        this.message = 'Can`t divide ' + number + ' by zero.';
        this.failingNumber = number;
    }
});
var divideByZeroError = new concordia.DivideByZeroError(5);
console.log(divideByZeroError.message);         //=> 'Can`t divide 5 by zero.'
console.log(divideByZeroError.failingNumber);   //=> 5
