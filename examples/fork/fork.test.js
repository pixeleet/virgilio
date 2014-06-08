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

before(function(done) {
    //Virgilio starts forks, which take a time to start up.
    //Give the process some time before running the tests.
    setTimeout(done, 300);
});

after(function() {
    process.exit();
});

describe('fork tests', function() {

    it('calls an action on a different process', function(done) {
        virgilio.execute('increment', 41)
            .then(function(response) {
                response.must.equal(42);
                done();
            }).done();
    });

    it('calls a failing action on a different process', function(done) {
        virgilio.execute('fail')
            .catch(function(error) {
                error.message.must.equal('Fail!');
                done();
            }).done();
    });
});
