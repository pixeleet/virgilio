var Concordia = require('../');
var concordia = new Concordia();

//Defining and calling a recursive action.
concordia.defineAction$('factorial', function(number) {
    if (number <= 1) {
        return 1;
    }
    return this.execute$(number - 1).then(function(result) {
        return result * number;
    });
});

concordia.factorial(3)
    .then(function(result) {
        console.log(result);    //=> 6
    });
