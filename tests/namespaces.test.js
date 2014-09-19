/* global describe, it, beforeEach */
var Concordia = require('../');

describe('Concordia.prototype.namespace$()', function() {
    var concordia = null;
    beforeEach(function() {
        concordia = new Concordia({
            logger: {
                streams: []
            }
        });
    });

    it('can reuse names in a namespace-chain', function() {
        concordia.namespace$('foo.foo');
        concordia.foo.foo.must.exist();
        concordia.foo.must.not.be(concordia.foo.foo);
    });

    it('can give an action the name of a namespce', function() {
        concordia.namespace$('foo').defineAction$('foo', function() {});
        concordia.foo.foo.must.exist();
        //concordia.foo is a namespace.
        concordia.foo.must.be.instanceof(Concordia);
        //concordia.foo.foo is an action.
        concordia.foo.foo.must.be.a.function();
    });

    it('will not overwrite with a namespace an existing property', function() {
        function testFunc() {
            concordia.foo = {};
            concordia.namespace$('foo');
        }
        testFunc.must.throw(concordia.IllegalNamespaceError);
    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            [],
            [{}],
            [function() {}],
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                concordia.namespace$.apply(concordia, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
