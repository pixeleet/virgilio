var Virgilio = require('../');
var virgilio = new Virgilio();

//Defining actions on namespaces.
virgilio.namespace$('animal.human').defineAction$(function speak() {
    return 'Hello world!';
});
virgilio.animal.defineAction$(function eat(food) {
    this.log$.info('Eating ' + food);
    return 'Om nom nom.';
});
virgilio.namespace$('plant').defineAction$(function photosynthesis(light) {
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
