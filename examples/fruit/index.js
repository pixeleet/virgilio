var Virgilio = require('../../');
var virgilio = new Virgilio()
    .use('virgilio-http')
    .loadModule(require('./fruit'))
    .loadModule(require('./fruitSalad'));
