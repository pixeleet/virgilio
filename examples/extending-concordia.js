var Virgilio = require('../');
var virgilio = new Virgilio();

//Extending a virgilio method.
virgilio.extend$(function _createAction$(actionName, func) {
    var newActionName = 'super' + actionName;
    return _createAction$.super$.call(this, newActionName, func);
});

//Calling an extended virgilio method.
virgilio.defineAction$(function foo() {});
console.log(typeof virgilio.foo);       //=> 'undefined'
console.log(typeof virgilio.superfoo);  //=> 'function'
