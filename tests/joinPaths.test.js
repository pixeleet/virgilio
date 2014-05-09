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
var Virgilio = require('../');

describe('Vergilio.prototype.joinPaths$()', function() {
    var joinPaths = Virgilio.prototype.joinPaths$;
    var testCases = [{
        basePath: 'a.b',
        relPath: 'c.d',
        joinPath: 'a.b.c.d'
    }, {
        basePath: 'a.b',
        relPath: 'b.d',
        joinPath: 'a.b.d'
    }, {
        basePath: 'a.b',
        relPath: 'a.d',
        joinPath: 'a.d'
    }, {
        basePath: void(0),
        relPath: 'a.b',
        joinPath: 'a.b'
    }, {
        basePath: void(0),
        relPath: void(0),
        joinPath: ''
    }];

    testCases.forEach(function(testCase) {
        var basePath = testCase.basePath;
        var relPath = testCase.relPath;
        var joinPath = testCase.joinPath;
        it('joins path `' + basePath + '` with `' + relPath + '` into `' +
                    joinPath + '`', function() {
            var result = joinPaths(basePath, relPath);
            result.must.eql(joinPath);
        });
    });
});
