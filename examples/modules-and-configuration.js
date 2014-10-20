var Concordia = require('../');
var options = {
    foo: 'bar'
};
var concordia = new Concordia(options);

//Getting the configuration in a module.
concordia.loadModule$(myModule);
function myModule(options) {
    console.log(options.foo);   //=> 'bar'
}
