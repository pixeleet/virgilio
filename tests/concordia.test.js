/* global describe, it */
var Virgilio = require('../');

describe('Virgilio.prototype.namespace$()', function() {
    it('can be called without `new`', function() {
        var virgilio = Virgilio();
        virgilio.must.be.instanceof(Virgilio);
    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            ['foo'],
            [function() {}]
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                Virgilio.apply(null, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
