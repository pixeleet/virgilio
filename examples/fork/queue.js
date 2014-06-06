var net = require('net');
var fs = require('fs');

//The unix socket we'll connect with.
var socketPath = '/tmp/virgilio.sock';

//Clean up existing socket file, if it exists.
if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
}

//This stream will act as your message queue.
var serverStream = new require('stream').PassThrough();

//The server that will handle connections to the socket.
net.createServer(function(socket) {
    socket
        .pipe(serverStream)
        .pipe(socket);
}).listen(socketPath);
