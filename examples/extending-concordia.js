var Concordia = require('../');
var concordia = new Concordia();

//Extending a concordia method.
concordia.extend$(function _createAction$(actionName, func) {
    var newActionName = 'super' + actionName;
    return _createAction$.super$.call(this, newActionName, func);
});

//Calling an extended concordia method.
concordia.defineAction$(function foo() {});
console.log(typeof concordia.foo);       //=> 'undefined'
console.log(typeof concordia.superfoo);  //=> 'function'
