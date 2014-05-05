var options = {};
module.exports = require('../../')(options)
    .use('virgilio-http')
    .loadModule(require('./number'));
