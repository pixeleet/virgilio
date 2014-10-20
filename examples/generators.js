var Virgilio = require('../');
var virgilio = new Virgilio();

//Defining actions through chaining. Only possible with support for generators!
virgilio
    .defineAction$(function add(num1, num2) {
        return num1 + num2;
    })
    .defineAction$(function* sum() {
        var args = Array.prototype.slice.call(arguments);
        var total = 0;
        var num = null;
        while ((num = args.pop())) {
            total = yield this.add(total, num);
        }
        return total;
    });

//Calling an action that calls another action.
virgilio.sum(1, 2, 3, 4)
    .then(function(result) {
        console.log(result);    //=> 10
    });
