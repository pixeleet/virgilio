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
var es = require('event-stream');
var childProcess = require('child_process');

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

//Set up the queue.
var queue = childProcess.fork(require.resolve('./queue'));

//Give the queue a time to start before connecting to it.
setTimeout(whenQueueIsUp, 100);
function whenQueueIsUp() {
    //Set up forked process.
    var fork = childProcess.fork(require.resolve('./fork'));

    //Kill everything when we exit.
    process.on('exit', function(code) {
        queue.kill();
        fork.kill();
    });

    //Pipe communication to and from the socket.
    var socket = net.connect(8945);
    socket
        .pipe(es.split())
        .pipe(es.parse())
        .pipe(virgilio.mediator$)
        .pipe(es.stringify())
        .pipe(es.mapSync(function(data) {
            return data + '\n';
        }))
        .pipe(socket);
}

module.exports = virgilio;
