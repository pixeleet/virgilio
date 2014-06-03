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

module.exports = function(options) {
    var virgilio = this;
    var words = ['app', 'apple', 'apparatus', 'appearance', 'alternate', 'box'];
    var history = [];
    var cache = {};

    virgilio
        .defineAction('search', search)
            .subscribe('search', saveHistory)
        .defineAction('search.getHistory', getHistory)
        .defineAction('getCacheSize', getCacheSize)
        .subscribe('addToCache', addToCache);

    function search(term) {
        var virgilio = this;
        var hits = cache[term];
        if (hits) {
            return hits;
        }
        hits = words.filter(function(hit) {
            return (hit.search(term) !== -1);
        });
        virgilio.publish('addToCache', term, hits);
        return hits;
    }

    function getHistory() {
        return history.slice();
    }

    function saveHistory(term) {
        history.push(term);
    }

    function addToCache(term, hits) {
        cache[term] = hits;
    }

    function getCacheSize() {
        return Object.keys(cache).length;
    }
};
