var Concordia = require('../');
var concordia = new Concordia();

//Defining actions on namespaces.
concordia.defineAction$('animal.human.speak', function() {
    return 'Hello world!';
});
concordia.animal.defineAction$('eat', function(food) {
    this.log$.info('Eating ' + food);
    return 'Om nom nom.';
});
concordia.namespace$('plant').defineAction$('photosynthesis',
                                            function(light) {
    return light ? 'C6H1206' : 'Zzzzzzz';
});

//Calling an action on a namespace.
concordia.animal.human.speak()
    .then(function(result) {
        console.log(result);    //=> 'Hello world!'
    });

//Calling an action on a lower namespace.
concordia.animal.human.eat()
    .then(function(result) {
        console.log(result);    //=> 'Om nom nom.'
    });

//Calling an action on a sibling namespace fails.
try {
    concordia.animal.photosynthesis();
}
catch(err) {
    console.log(err instanceof TypeError);  //=> true
}
