var Virgilio = require('../');
var virgilio = new Virgilio();

//Defining actions on namespaces.
virgilio.defineAction$('animal.human.speak', function() {
    return 'Hello world!';
});
virgilio.animal.defineAction$('eat', function(food) {
    this.log$.info('Eating ' + food);
    return 'Om nom nom.';
});
virgilio.namespace$('plant').defineAction$('photosynthesis',
                                            function(light) {
    return light ? 'C6H1206' : 'Zzzzzzz';
});

//Calling an action on a namespace.
virgilio.animal.human.speak()
    .then(function(result) {
        console.log(result);    //=> 'Hello world!'
    });

//Calling an action on a lower namespace.
virgilio.animal.human.eat()
    .then(function(result) {
        console.log(result);    //=> 'Om nom nom.'
    });

//Calling an action on a sibling namespace fails.
try {
    virgilio.animal.photosynthesis();
}
catch(err) {
    console.log(err instanceof TypeError);  //=> true
}
