var Concordia = require('../');
var concordia = new Concordia();

//Extending a concordia method.
concordia.extend$('defineAction$', function defineAction$(actionName, func) {
    var newActionName = 'super' + actionName;
    return defineAction$.super$.call(this, newActionName, func);
});

//Calling an extended concordia method.
concordia.defineAction$('foo', function() {});
console.log(typeof concordia.foo);       //=> 'undefined'
console.log(typeof concordia.superfoo);  //=> 'function'
