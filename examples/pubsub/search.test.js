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

describe('search tests', function() {

    it('returns search results', function(done) {
        virgilio.execute('search', 'app')
            .then(function(hits) {
                hits.must.eql(['app', 'apple', 'apparatus', 'appearance']);
                done();
            });
    });

    it('updates its search history', function(done) {
        virgilio.execute('search.getHistory')
            .then(function(history) {
                history.must.eql(['app']);
                done();
            });
    });

    it('updates its cache', function(done) {
        virgilio.publish('addToCache', 'foo', []);
        virgilio.execute('getCacheSize')
            .then(function(cacheSize) {
                cacheSize.must.equal(2);
                done();
            });
    });
});
