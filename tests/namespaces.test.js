/* global describe, it, beforeEach */
var Virgilio = require('../');

describe('Virgilio.prototype.namespace$()', function() {
    var virgilio = null;
    beforeEach(function() {
        virgilio = new Virgilio({
            logger: {
                streams: []
            }
        });
    });

    it('can reuse names in a namespace-chain', function() {
        virgilio.namespace$('foo.foo');
        virgilio.foo.foo.must.exist();
        virgilio.foo.must.not.be(virgilio.foo.foo);
    });

    it('can give an action the name of a namespce', function() {
        virgilio.namespace$('foo').defineAction$('foo', function() {});
        virgilio.foo.foo.must.exist();
        //virgilio.foo is a namespace.
        virgilio.foo.must.be.instanceof(Virgilio);
        //virgilio.foo.foo is an action.
        virgilio.foo.foo.must.be.a.function();
    });

    it('will not overwrite with a namespace an existing property', function() {
        function testFunc() {
            virgilio.foo = {};
            virgilio.namespace$('foo');
        }
        testFunc.must.throw(virgilio.IllegalNamespaceError);
    });

    describe('Test namespace validator', function() {

        it('can use simple words as a namespace', function() {
            var validator = virgilio.util$.validateNamespaceName;
            validator('foo').must.be.true();
            validator('f').must.be.true();
        });

        it('can use valid namespace', function() {
            var validator = virgilio.util$.validateNamespaceName;

            validator("foo.bar").must.be.true();
            validator("foo.bar.baz").must.be.true();
            validator("f.b").must.be.true();
            validator("f.b.b").must.be.true();
        });

        it('cannot be empty namespace', function() {
            var validator = virgilio.util$.validateNamespaceName,
                wrapper = function(path) {
                    return function() {
                        return validator(path);
                    }
                };

            wrapper("").must.throw(/^Invalid namespace name .*/);
            wrapper(" ").must.throw(/^Invalid namespace name .*/);
        });

        it ('cannot use invalid namespaces', function() {
            var validator = virgilio.util$.validateNamespaceName,
                wrapper = function(path) {
                    return function() {
                        return validator(path);
                    }
                };

            wrapper(".").must.throw(/^Invalid namespace name .*/);
            wrapper("...").must.throw(/^Invalid namespace name .*/);
            wrapper(".foo").must.throw(/^Invalid namespace name .*/);
            wrapper("...foo").must.throw(/^Invalid namespace name .*/);
            wrapper("foo.").must.throw(/^Invalid namespace name .*/);
            wrapper("foo...").must.throw(/^Invalid namespace name .*/);
            wrapper("foo...bar").must.throw(/^Invalid namespace name .*/);
        });

    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            [],
            [{}],
            [function() {}],
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                virgilio.namespace$.apply(virgilio, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
