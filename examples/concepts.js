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

// Virgilio .ctor
var virgilio = require('Virgilio')(); // ==> arguments should be options

// how to expose the log => bunyan
virgilio.log.info('info message');

// Define a group of actions aka namespace
virgilio.defineNamespace('stores');

// Define an action in a predefined namespace
virgilio.stores.defineAction('getAll', function(lat, long, radius) {
  return [];
});

// call a method from everywhere
virgilio
	.execute('stores.getAll', 1, 2, 3)
	.then()
	.done();

// function as endpoint
module.exports.config = {
  'stores.getAll': {
    path: '/stores/',
    method: 'GET',
    transform: function(req) { // I
      var body = req.body;
      return [body.lat, body.long, body.radius];
    },
    respond: function(res, result) { // II

    },
    error: function(err, res) { // III handleHTTP().then(tranform).then(getAll).done(respond).error(error)
      if (err.code === 400) {
        res.send(400, 'fooooo');
      }
    }
  }
};


// the wrapper around a service definition
_.keys(config, function(svcname) {
  var serviceConfig = config[svcname];
  server[serviceConfig] = function(req, res, next) {
    var params = serviceConfig.transform(req);
    try {
        res.send(200, virgilio.execute.apply(svcname, params));
    } catch(Error err) {
      res.send(400, err);
    }
  };
});

// declare a module
module.export = function(virgilio) {
  virgilio.defineNamespace('foooooo');
};


// internal module registration
virgilio.registerModule = function(requiredModule) {
  requiredModule.call(this, virgilio);
};

// the puppeteer reads from the config and verbosely calls the module registration
virgilio.registerModule(require('foooooo'));


// virgilio http adapter









//Virgilio BAC
var markCorley = require('mark-corley');
var options = require('./options');
var virgilio = require('virgilio')()
	.use('http')
	.loadModule('auth')
	.loadModule('main')
	.loadModule('bright-sci')

module.exports = virgilio;

//in options file:
module.exports = {
	http: {
		port: 4000,
		endpoints: {
			'sci.getBalance': {
				path: '/balance/:tokenId',
				method: 'GET',
				auth: true
			}
		}
	}
	//QUESTION default transform, respond and error functions?
};

//in bright-sci package:
module.exports = function(options) {
	var virgilio = this;

	//QUESTION is it necessary to define 'sci' namespace explicitly?
	virgilio
		.loadModule('sci')
		.loadModule('main');
};

//in sci module:
module.exports = function(options) {
	var virgilio = this;

	var sciNamespace = virgilio.defineNamespace('sci');

	options['sci.transfer'].roles = ['ContentManager'];
	sciNamespace.defineAction('transfer', transfer);

	function transfer(fromTokenId, toTokenId, amount) {
		return markCorley.request('convert', { /* params */ })
			.all([
				virgilio.execute('sci.getBalance', [ fromTokenId ]),
				virgilio.execute('sci.getBalance', [ toTokenId ])
			])
			.catch(function(err) {
				//perform some error handling
			});
	}

	virgilio.http({
		'/admin/': {
			'GET': 'sci.home',
			'transfer/': {
				'POST': {
					handler: 'sci.transfer',
					transform: function() {},
					respond: function() {},
					error: function() {}
				},
				'GET': 'sci.balance'
			}
		}
	});
};

//in the auth package:
module.exports = function(options) {
	var virgilio = this;

	virgilio.execute('http.registerMiddleware', 'auth');

	virgilio.defineAction('auth', function(req, res, next) {

	});
};

//in the http port package:
module.exports = function(options) {
	var virgilio = this;
	var app = restify();

	virgilio.defineAction('http.registerMiddleware', function(middleware) {
		restify.use(virgilio.execute(middleware, arguments));
	});

	virgilio.prototype.http = function(definition) {
		this.execute$('http', definition);
	};
};
