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

var errors = [{
    name: 'InvalidModuleError',
    message: function(module) {
        var message = [
            'Invalid Virgilio Module.',
            'Are you sure it\'s a function?',
            'Invalid module: `%s`'
        ].join(' ');
        return nodeUtil.format(message, [module]);
    }
}, {
    name: 'InvalidPathError',
    message: function(path) {
        var message = [
            'Invalid Virgilio Path.',
            'Are you sure it\'s a string?',
            'Invalid path: `%s`'
        ].join(' ');
        return nodeUtil.format(message, [module]);
    }
}, {
    name: 'NotAnActionError',
    message: function(actionName) {
        var message = '`%s` is not an action known by Virgilio';
        return nodeUtil.format(message, [module]);
    }
}];

//Add each module to the module.exports.
errors.forEach(function(error) {
    module.exports[error.name] = util.createCustomError(error);
});
