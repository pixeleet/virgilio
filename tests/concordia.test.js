/* global describe, it */
var Concordia = require('../');

describe('Concordia.prototype.namespace$()', function() {
    it('can be called without `new`', function() {
        var concordia = Concordia();
        concordia.must.be.instanceof(Concordia);
    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            ['foo'],
            [function() {}]
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                Concordia.apply(null, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
