var Virgilio = require('../../');
module.exports = new Virgilio()
    .use('http')
    .loadModule(require('./fruit'))
    .loadModule(require('./fruitSalad'));
