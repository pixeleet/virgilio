var Concordia = require('../');
var concordia = new Concordia();

//Loading a module on a namespace.
concordia.namespace$('answers').loadModule$(myModule);
function myModule() {
    var concordia = this;
    concordia.defineAction$('ultimate', function() {
        return 42;
    });
}

//Calling an action loaded in a module on a namespace.
concordia.answers.ultimate()
    .then(function(result) {
        console.log(result);    //=> 42
    });
