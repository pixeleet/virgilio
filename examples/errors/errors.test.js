var virgilio = require('./');

describe('extend virgilio with custom errors', function(done) {
    it('makes them available', function(done) {
        var customError = new virgilio.TestError('test');
        customError.must.be.instanceof(virgilio.TestError);
        done();
    });

    it('throws an exception when adding a duplicate exception', function() {
        var customDuplicateError = {
            name: 'TestError',
            init: function(module) {
                var message = [
                    'Invalid Virgilio Module.',
                    'Are you sure it\'s a function?',
                    'Invalid module: `%s`'
                ].join(' ');
                this.message = nodeUtil.format(message, [module]);
            }
        };

        var test = function() {
            virgilio.registerError$(customDuplicateError);
        };

        test.must.throw(virgilio.DuplicateErrorRegistrationError);
    });
});
