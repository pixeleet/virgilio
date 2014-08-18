suite('Namespaces');
var Virgilio = require('../');
var config = require('./testConfig.json');
var virgilio = new Virgilio(config);

test('Defining actions on a namespaces', function() {
    virgilio.defineAction$('animal.human.speak', function() {
        return 'Hello world!';
    });

    //Note that the animal namespace has been created in the previous call.
    virgilio.animal.defineAction$('eat', function(food) {
        this.log.info('Eating ' + food);
        return 'Om nom nom.';
    });

    virgilio.namespace$('plant').defineAction$('photosynthesis',
                                               function(light) {
        return light ? 'C6H1206' : 'Zzzzzzz';
    });
});

test('Calling an action on a namespace', function(done) {
    virgilio.animal.human.speak()
        .then(function() {
            done();
        });
});

test('Calling an action on a lower namespace', function(done) {
    virgilio.animal.human.eat()
        .then(function() {
            done();
        });
});

test('Calling an action on a sibling namespace fails', function(done) {
    try {
        virgilio.animal.photosynthesis();
    }
    catch(err) {
        err.must.be.instanceof(TypeError);
        done();
    }
});
