/* global describe, it, beforeEach */
var Concordia = require('../');

describe('Concordia.prototype.regsterError$()', function() {
    var concordia = null;
    beforeEach(function() {
        concordia = new Concordia({
            logger: {
                name: 'concordia',
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
});
