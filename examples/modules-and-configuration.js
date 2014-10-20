var Virgilio = require('../');
var options = {
    foo: 'bar'
};
var virgilio = new Virgilio(options);

//Getting the configuration in a module.
virgilio.loadModule$(myModule);
function myModule(options) {
    console.log(options.foo);   //=> 'bar'
}
