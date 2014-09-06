/* global describe, it, beforeEach */
var Virgilio = require('../');

describe('Virgilio.prototype.namespace$()', function() {
    var virgilio = null;
    beforeEach(function() {
        virgilio = new Virgilio({
            logger: {
                name: 'virgilio',
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
});
