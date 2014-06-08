var net = require('net');
var fs = require('fs');

//This stream will act as your message queue.
var serverStream = new require('stream').PassThrough();

//The server that will handle connections to the socket.
net.createServer(function(socket) {
    socket
        .pipe(serverStream)
        .pipe(socket);
}).listen(8945);
