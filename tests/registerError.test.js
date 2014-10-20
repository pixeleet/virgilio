/* global describe, it, beforeEach */
var Virgilio = require('../');

describe('Virgilio.prototype.registerError$()', function() {
    var virgilio = null;
    beforeEach(function() {
        virgilio = new Virgilio({
            logger: {
                streams: []
            }
        });
    });

    it('Can create an error with just a name', function() {
        virgilio.registerError$('FooError');
        var error = new virgilio.FooError('test');
        error.name.must.be('FooError');
        error.stack.must.not.be.null();
        error.must.be.instanceof(Error);
    });

    it('Can create an error with a named function', function() {
        virgilio.registerError$(function FooError(arg) {
            this.arg = arg;
        });
        var error = new virgilio.FooError('test');
        error.name.must.be('FooError');
        error.stack.must.not.be.null();
        error.must.be.instanceof(Error);
        error.arg.must.be('test');
    });

    it('Can create an error with a name and init function', function() {
        virgilio.registerError$('FooError', function errorInit(arg) {
            this.arg = arg;
        });
        var error = new virgilio.FooError('test');
        error.name.must.be('FooError');
        error.stack.must.not.be.null();
        error.must.be.instanceof(Error);
        error.arg.must.be('test');
    });

    it('Cannot register an error with the same name twice', function() {
        function testFunc() {
            virgilio.registerError$('FooError', function() {});
            virgilio.registerError$(function FooError() {});
        }
        testFunc.must.throw(virgilio.DuplicateErrorRegistrationError);
    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            [],
            [function() {}],
            ['']
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                virgilio.registerError$.apply(virgilio, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
