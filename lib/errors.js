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

var nodeUtil = require('util');
var util = require('./util');

var errors = [
    function IllegalNamespaceError(path, name) {
        var message = [
            'Creating new namespace \'%s\' on \'%s\' failed.',
            'A property with that name already exists.',
        ].join(' ');
        this.message = nodeUtil.format(message, name, path);
    },
    function DuplicateErrorRegistrationError(errorName) {
        var message = [
            'Invalid Concordia Error.',
            'Duplicate Error type: `%s`'
        ].join(' ');
        this.message = nodeUtil.format(message, [errorName]);
    }
];

//Add each module to the module.exports.
errors.forEach(function(error) {
    exports[error.name] = util.createCustomError(error);
});
