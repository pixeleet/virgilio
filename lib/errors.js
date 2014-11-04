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
            'Invalid Virgilio Error.',
            'Duplicate Error type: `%s`'
        ].join(' ');
        this.message = nodeUtil.format(message, [errorName]);
    }
];

//Add each module to the module.exports.
errors.forEach(function(error) {
    exports[error.name] = util.createCustomError(error.name, error);
});
