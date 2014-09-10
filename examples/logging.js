var PassThrough = require('stream').PassThrough;
var logStream = new PassThrough();

var Concordia = require('../');
var options = {
    logger: {
        name: 'blastream',
        streams: [{
            stream: logStream,
            level: 'info'
        }]
    }
};
var concordia = new Concordia(options);

//Log a message from an action on a namespace.
concordia.defineAction$('parrot.talk', function(line) {
    this.log$.info(line);
});

logStream.on('data', function(chunk) {
    var log = JSON.parse(chunk.toString());
    console.log(log.name);      //=> 'blastream'
    console.log(log.context);   //=> 'concordia.parrot.talk'
    console.log(log.msg);       //=> 'Hi there!'
});

concordia.parrot.talk('Hi there!');
