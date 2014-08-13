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

describe('extend tests', function() {
    it('still calls defineAction like before', function(done) {
        virgilio.defineAction('bar', function(one, two) {
            one.must.equal(1);
            two.must.equal(2);
            done();
        });

        virgilio.superbar(1, 2);
    });
});
