var Virgilio = require('../');
var virgilio = new Virgilio();

//Defining actions through chaining.
virgilio
    .defineAction$('add', function(num1, num2) {
        return num1 + num2;
    })
    .defineAction$('subtract', function(num1, num2) {
        return this.add(num1, -num2);
    });

//Calling an action that calls another action.
virgilio.subtract(5, 2)
    .then(function(result) {
        console.log(result);    //=> 3
    });
