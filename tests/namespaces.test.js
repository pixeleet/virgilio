/* global describe, it, beforeEach */
var Concordia = require('../');

describe('Concordia.prototype.namespace$()', function() {
    var concordia = null;
    beforeEach(function() {
        concordia = new Concordia({
            logger: {
                name: 'concordia',
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
});
