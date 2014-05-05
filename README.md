# Virgilio
Virgilio is a minimalist library for helping you write modular applications.

## Getting started

The following creates a Virglio instance and tells it to load the foo module and a custom foo-module.

	var options = {};
	require('virgilio')(options)
		.use('foo')
		.loadModule('number');

Below is an example of what a number module might look like.

	module.exports = function(options) {
		var virgilio = this;
		virgilio.namespace('number')
			.defineAction('add', add)
			.defineAction('subtract', subtract);

		function add(num1, num2) {
			return (num1 + num2);
		}

		function subtract(num1, num2) {
			var virgilio = this;
			return virgilio.execute('number.add', num1, -num2);
		}
	}

Then somewhere else, you might call:

	virgilio.execute('number.subtract', 8, 3)
		.then(function(result) {
			console.log(result) //5
		}).done();

## API
### Virgilio( [options] )
Create a virgilio instance. The optional options object is shared among all registered modules.

### modulesvirgilio.loadModule( moduleRef )
`moduleRef` can be a direct reference to a Virgilio module, or a requirable string, that is a package name or filepath.

A virgilio module is a function that takes a single options argument. The function is bound to the virgilio instance and instantly called.

### virgilio.use( moduleRef )
`use` is an alias for `loadModule`. It is good practice to use `use` for loading virgilio-extensions and `loadModule` for application components.

### virgilio.defineAction( actionName, actionHandler )
Register an action with virgilio. The `actionName` is automatically scoped to the namespace it was called from.

### virgilio.execute( actionName [, arg1, arg2, ...])
Execute an action with certain arguments. `actionName` is automatically scoped to the namespace it was called from.


`execute` always returns a promise for the result of the action, even if the action itself directly returns a value!

### virgilio.namespace( name )
Get a reference to a certain namespace. If it doesn't exist, it is created for you. The returned namespace-object proxies all virgilio methods. This method allows you to write:

	virgilio.defineAction('foo.bar.sub.run')
			.defineAction('foo.bar.sub.stop');

as:

	virgilio.namespace('foo.bar.sub')
		.defineAction('run')
		.defineAction('stop');

# virgilio.log
A bunyan instance to use for logging. For instance:

	virgilio.log.info('Everything running smoothly!');
	virgilio.log.error('Ouch');



We dedicate this Library to the ServiceRegistrar, the EigenServices and the PuppetDresser.
