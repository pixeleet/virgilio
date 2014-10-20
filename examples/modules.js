var Concordia = require('../');
var concordia = new Concordia();

//Loading a module.
concordia.loadModule$(myModule);
function myModule() {
    var concordia = this;
    concordia.defineAction$('answer', function() {
        return 42;
    });
}

//Calling an action loaded in a module.
concordia.answer()
    .then(function(result) {
        console.log(result);    //=> 42
    });
