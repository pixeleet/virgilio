var PassThrough = require('stream').PassThrough;
var logStream = new PassThrough();

var Virgilio = require('../');
var options = {
    logger: {
        name: 'blastream',
        streams: [{
            stream: logStream,
            level: 'info'
        }]
    }
};
var virgilio = new Virgilio(options);

//Log a message from an action on a namespace.
virgilio.defineAction$('parrot.talk', function(line) {
    this.log$.info(line);
});

logStream.on('data', function(chunk) {
    var log = JSON.parse(chunk.toString());
    console.log(log.name);      //=> 'blastream'
    console.log(log.context);   //=> 'virgilio.parrot.talk'
    console.log(log.msg);       //=> 'Hi there!'
});

virgilio.parrot.talk('Hi there!');
