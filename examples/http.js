//Beware: these tests require the virgilio-http module to be symbolically linked!

var Virgilio = require('../');
var virgilio = new Virgilio();

virgilio
    .use('virgilio-http')
	.execute('http.registerRoutes', {
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
