var nodeUtil = require('util');
var Virgilio = require('../../');
var options = {
    logger: {
        name: 'virgilio',
        streams: []
    }
};

var virgilio = new Virgilio(options);

virgilio.registerError$({
    name: 'TestError',
    init: function(module) {
        var message = [
            'Invalid Virgilio Module.',
            'Are you sure it\'s a function?',
            'Invalid module: `%s`'
        ].join(' ');
        this.message = nodeUtil.format(message, [module]);
    }
});

module.exports = virgilio;
