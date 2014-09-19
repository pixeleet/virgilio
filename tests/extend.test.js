/* global describe, it, beforeEach */
var format = require('util').format;
var Concordia = require('../');

describe('Concordia.prototype.extend$()', function() {
    var concordia = null;
    beforeEach(function() {
        concordia = new Concordia({
            logger: {
                streams: []
            }
        });
    });

    it('Can call extend$ with a named function', function() {
        concordia.extend$(function namespace$(path) {
            path = 'foo.' + path;
            return namespace$.super$.call(this, path);
        });
        concordia.namespace$('bar').must.equal(concordia.foo.bar);
    });

    it('Can call extend$ with a seperate name and function', function() {
        concordia.extend$('namespace$', function prefixFoo(path) {
            path = 'foo.' + path;
            return prefixFoo.super$.call(this, path);
        });
        concordia.namespace$('bar').must.equal(concordia.foo.bar);
    });

    describe('Throws an error when called with wrong arguments', function() {
        var testCases = [
            [],
            [function() {}],
            ['']
        ];
        testCases.forEach(function(args) {
            function testFunc() {
                concordia.extend$.apply(concordia, args);
            }
            it('Called with ' + args.join(', '), function() {
                testFunc.must.throw(/called with invalid arguments/);
            });
        });
    });
});
