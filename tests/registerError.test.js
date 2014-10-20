/* global describe, it, beforeEach */
var Concordia = require('../');

describe('Concordia.prototype.registerError$()', function() {
    var concordia = null;
    beforeEach(function() {
        concordia = new Concordia({
            logger: {
                streams: []
            }
        });
    });

    it('Can create an error with just a name', function() {
        concordia.registerError$('FooError');
        var error = new concordia.FooError('test');
        error.name.must.be('FooError');
        error.stack.must.not.be.null();
        error.must.be.instanceof(Error);
    });

    it('Can create an error with a named function', function() {
        concordia.registerError$(function FooError(arg) {
            this.arg = arg;
        });
        var error = new concordia.FooError('test');
        error.name.must.be('FooError');
        error.stack.must.not.be.null();
        error.must.be.instanceof(Error);
        error.arg.must.be('test');
    });

    it('Can create an error with a name and init function', function() {
        concordia.registerError$('FooError', function errorInit(arg) {
            this.arg = arg;
        });
        var error = new concordia.FooError('test');
        error.name.must.be('FooError');
        error.stack.must.not.be.null();
        error.must.be.instanceof(Error);
        error.arg.must.be('test');
    });

    it('Cannot register an error with the same name twice', function() {
        function testFunc() {
            concordia.registerError$('FooError', function() {});
            concordia.registerError$(function FooError() {});
        }
        testFunc.must.throw(concordia.DuplicateErrorRegistrationError);
    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            [],
            [function() {}],
            ['']
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                concordia.registerError$.apply(concordia, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
