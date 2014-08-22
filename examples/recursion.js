var Virgilio = require('../');
var virgilio = new Virgilio();

//Defining and calling a recursive action.
virgilio.defineAction$('factorial', function(number) {
    if (number <= 1) {
        return 1;
    }
    return this.execute$(number - 1).then(function(result) {
        return result * number;
    });
});

virgilio.factorial(3)
    .then(function(result) {
        console.log(result);    //=> 6
    });
