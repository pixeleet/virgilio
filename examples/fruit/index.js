var Virgilio = require('../../');
module.exports = new Virgilio()
    .loadModule(require('./fruit'))
    .loadModule(require('./fruitSalad'));
