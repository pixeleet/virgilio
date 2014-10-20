var Virgilio = require('../');
var virgilio = new Virgilio();

//Loading a module on a namespace.
virgilio.namespace$('answers').loadModule$(myModule);
function myModule() {
    var virgilio = this;
    virgilio.defineAction$('ultimate', function() {
        return 42;
    });
}

//Calling an action loaded in a module on a namespace.
virgilio.answers.ultimate()
    .then(function(result) {
        console.log(result);    //=> 42
    });
