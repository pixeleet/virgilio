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
var virgilio = require('./');

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
            virgilio.fruit.findAll()
                .then(function(fruits) {
                    checkFruits(fruits);
                    done();
                }).done();
        });

        it('Calls an action on a namespace', function(done) {
            virgilio.namespace('fruit').findAll()
                .then(function(fruits) {
                    checkFruits(fruits);
                    done();
                }).done();
        });

        it('Calls an action defined on the root, regardless of namespace',
                    function(done) {
            virgilio.namespace('a.very.long.name').fruit.findAll()
                .then(function(fruits) {
                    checkFruits(fruits);
                    done();
                }).done();
        });

        it('Calls an action that in turn calls another', function(done) {
            virgilio.salad.getRandom()
                .then(function(salad) {
                    salad.must.not.be.undefined();
                    done();
                }).done();
        });

        it('Catches errors thrown by modules, and returns a rejected promise',
                    function(done) {
            virgilio.fruit.delete('ananas')
                .catch(function(err) {
                    err.must.not.be.undefined();
                    done();
                }).done();
        });

        it('throws a TypeError when a non-existing action is called',
                    function(done) {
            try {
                virgilio.fruit.eat('apple');
            }
            catch(err) {
                err.must.be.instanceof(TypeError);
                return done();
            }
            throw new Error('No error was thrown.');
        });

        it('Passes all arguments to an action', function(done) {
            virgilio.defineAction('test', function(k, l, m) {
                k.must.equal(1);
                l.must.equal(2);
                m.must.equal(3);
                done();
            });
            virgilio.test(1, 2, 3).done();
        });
    });

    describe('defining actions', function() {
        var fooAction = function() { return 'foo'; };

        it('Allows defining an action', function(done) {
            virgilio.defineAction('foo', fooAction);
            virgilio.foo()
                .then(function(response) {
                    response.must.equal('foo');
                    done();
                })
                .done();
        });

        it('Allows defining an action on a namespace', function(done) {
            virgilio.namespace('a.long.name').defineAction('bar', fooAction);
            virgilio.a.long.name.bar()
                .then(function(response) {
                    response.must.equal('foo');
                    done();
                })
                .done();
        });

        it('Has access to a logger instance', function(done) {
            virgilio.defineAction('loggerTest', function() {
                this.log.trace.must.be.a.function();
                this.log.info.must.be.a.function();
                this.log.error.must.be.a.function();
                done();
            });
            virgilio.loggerTest();
        });

        it('Returns the same virgilio instance, for chaining', function() {
            var result = virgilio.defineAction('chainTest', function() {});
            result.must.equal(virgilio);
        });
    });
});
