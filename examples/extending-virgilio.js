var Virgilio = require('../');
var virgilio = new Virgilio();

//Extending a virgilio method.
virgilio.extend$('defineAction$', function(actionName, func) {
    var newActionName = 'super' + actionName;
    return this.super$(newActionName, func);
});

//Calling an extended virgilio method.
virgilio.defineAction$('foo', function() {});
console.log(typeof virgilio.foo);       //=> 'undefined'
console.log(typeof virgilio.superfoo);  //=> 'function'
