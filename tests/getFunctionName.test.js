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
var getFunctionName = require('../lib/util').getFunctionName;

describe('util.getFunctionName()', function() {
    var testCases = [{
        func: function test1(){},
        name: 'test1'
    }, {
        func: function test2 () {},
        name: 'test2'
    }, {
        func: function   test3   () {},
        name: 'test3'
    }];

    testCases.forEach(function(testCase) {
        var func = testCase.func;
        var name = testCase.name;
        it('gets the correct function name: ' + name, function() {
            var result = getFunctionName(func);
            result.must.equal(name);
        });
    });
});

