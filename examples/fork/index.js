// Copyright (C) 2014 IceMobile Agency B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var net = require('net');
var fs = require('fs');
var es = require('event-stream');

//Set up Virgilio.
var Virgilio = require('../../');
var options = {
    //Don't log anything (it's annoying when runnig tests).
    logger: {
        name: 'virgilio',
        streams: []
    },
    passThrough: false
};
var virgilio = new Virgilio(options);

//Set up socket.
var socketPath = '/tmp/virgilio.sock';
if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
}
net.createServer(function()).listen(socketPath);
var socket = net.connect(socketPath);

//Set up forked process.
require('child_process').fork(require.resolve('./fork'));

//Pipe communication to the socket.
virgilio.mediator$
    .pipe(es.mapSync(function(data) {
        return JSON.stringify(data);
    }))
    .pipe(socket);

socket
    .pipe(es.mapSync(function(data) {
        return JSON.parse(data);
    }))
    .pipe(virgilio.mediator$);

module.exports = virgilio;
