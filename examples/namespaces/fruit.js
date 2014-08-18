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

module.exports = function() {
    var virgilio = this;
    var fruits = [ 'apple', 'pear', 'banana', 'melon' ];

    virgilio.namespace$('fruit')
        .defineAction$('findAll', function() {
            this.log.info('Searching for fruits...');
            return fruits.slice(0);
        })
        .defineAction$('find', function(fruitId) {
            var fruit = fruits[fruitId];
            if (!fruit) {
                throw new Error('No fruit with index: ' + fruitId);
            }
            return fruit;
        })
        .defineAction$('create', function(fruit) {
            if (fruits.indexOf(fruit) === -1) {
                fruits.push(fruit);
            }
        })
        .defineAction$('delete', function(fruit) {
            var fruitIndex = fruits.indexOf(fruit);
            if (fruitIndex === -1) {
                throw 'fruit `' + fruit + '` does not exist';
            }
            delete fruits[fruitIndex];
        });
};
