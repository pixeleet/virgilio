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
var virgilio = require('./');
var Promise = require('bluebird');

describe('remindme tests', function() {

    it('returns a rejected promise if it has to wait to long', function(done) {
        virgilio.execute('remindMe', 200)
            .then(function() {
                done(new Error('Promise wasn\'t rejected.'));
            })
            .catch(function(error) {
                error.must.be.instanceof(Promise.TimeoutError);
                done();
            });
    });

    it('succeeds if the default timeout has been overwritten', function(done) {
        virgilio.execute('remindMe', 200)
            .withTimeout(300)
            .then(function(response) {
                response.must.equal('reminder!');
                done();
            }).done();
    });
});
