var Virgilio = require('../');
var virgilio = new Virgilio();

//Loading a module.
virgilio.loadModule$(myModule);
function myModule() {
    var virgilio = this;
    virgilio.defineAction$('answer', function() {
        return 42;
    });
}

//Calling an action loaded in a module.
virgilio.answer()
    .then(function(result) {
        console.log(result);    //=> 42
    });
