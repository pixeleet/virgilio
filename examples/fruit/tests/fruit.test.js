// Copyright (C) 2014 IceMobile Agency B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global describe, it*/
var Promise = require('bluebird');
var virgilio = require('../');

describe('fruit tests', function() {

    it('Throws an error when loading a non-existing module', function() {
        var test = function() {
            virgilio.loadModule('foobar');
        };
        test.must.throw(virgilio.InvalidModuleError);
    });

    describe('calling actions', function() {
        function checkFruits (fruits) {
            fruits = fruits.sort();
            fruits.must.eql([ 'apple', 'banana', 'melon', 'pear' ]);
        }

        it('Calls an action and returns the result', function(done) {
            virgilio.execute('fruit.findAll')
                .then(function(fruits) {
                    checkFruits(fruits);
                    done();
                }).done();
        });

        it('Calls an action on a namespace', function(done) {
            virgilio.namespace('fruit').execute('findAll')
                .then(function(fruits) {
                    checkFruits(fruits);
                    done();
                }).done();
        });

        it('Calls an action defined on the root, regardless of namespace',
                    function(done) {
            virgilio.namespace('a.namespace.is.long').execute('fruit.findAll')
                .then(function(fruits) {
                    checkFruits(fruits);
                    done();
                }).done();
        });

        it('Calls an action that in turn calls another', function(done) {
            virgilio.execute('salad.getRandom')
                .then(function(salad) {
                    salad.must.not.be.undefined();
                    done();
                }).done();
        });

        it('Catches errors thrown by modules, and returns a rejected promise',
                    function(done) {
            virgilio.execute('fruit.delete', 'ananas')
                .catch(function(err) {
                    err.must.not.be.undefined();
                    done();
                }).done();
        });

        it('Returns a rejected promise, when a non-existing action is called',
                    function(done) {
            virgilio.execute('fruit.eat', 'apple')
                .catch(function(err) {
                    err.must.be.instanceof(Promise.TimeoutError);
                    done();
                }).done();
        });

        it('Passes all arguments to an action', function(done) {
            virgilio.defineAction('test', function(k, l, m) {
                k.must.equal(1);
                l.must.equal(2);
                m.must.equal(3);
                done();
            });
            virgilio.execute('test', 1, 2, 3).done();
        });
    });

    describe('defining actions', function() {
        var fooAction = function() { return 'foo'; };
        var testFoo = function(actionName, done) {
            virgilio.execute(actionName)
                .then(function(response) {
                    response.must.equal('foo');
                    done();
                })
                .done();
        };

        it('Allows defining an action', function(done) {
            virgilio.defineAction('foo', fooAction);
            testFoo('foo', done);
        });

        it('Allows defining an action on a namespace', function(done) {
            virgilio.namespace('a.namespace').defineAction('bar', fooAction);
            testFoo('a.namespace.bar', done);
        });

        it('Has access to a logger instance', function(done) {
            virgilio.defineAction('ice', function() {
                this.log.trace.must.be.a.function();
                this.log.info.must.be.a.function();
                this.log.error.must.be.a.function();
                done();
            });
            virgilio.execute('ice');
        });

        it('Returns the same virgilio instance, for chaining', function() {
            var result = virgilio.defineAction('foo', function() {});
            result.must.equal(virgilio);
        });
    });
});
