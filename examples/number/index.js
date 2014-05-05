var options = {};
module.exports = require('../../')(options)
    .use('http')
    .loadModule(require('./number'));
