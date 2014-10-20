/* global describe, it, beforeEach */
var format = require('util').format;
var Virgilio = require('../');

describe('Virgilio.prototype.extend$()', function() {
    var virgilio = null;
    beforeEach(function() {
        virgilio = new Virgilio({
            logger: {
                streams: []
            }
        });
    });

    it('Can call extend$ with a named function', function() {
        virgilio.extend$(function namespace$(path) {
            path = 'foo.' + path;
            return namespace$.super$.call(this, path);
        });
        virgilio.namespace$('bar').must.equal(virgilio.foo.bar);
    });

    it('Can call extend$ with a seperate name and function', function() {
        virgilio.extend$('namespace$', function prefixFoo(path) {
            path = 'foo.' + path;
            return prefixFoo.super$.call(this, path);
        });
        virgilio.namespace$('bar').must.equal(virgilio.foo.bar);
    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            [],
            [function() {}],
            ['']
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                virgilio.extend$.apply(virgilio, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
