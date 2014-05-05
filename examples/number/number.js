module.exports = function(options) {
    var virgilio = this;
    virgilio.namespace('number')
        .defineAction('add', add)
        .defineAction('subtract', subtract);

    function add(num1, num2) {
        num1 = parseInt(num1, 10);
        num2 = parseInt(num2, 10);
        return (num1 + num2);
    }

    function subtract(num1, num2) {
        var virgilio = this;
        return virgilio.execute('number.add', num1, -num2);
    }

    virgilio.http({
        '/number': {
            '/add/:num1/:num2': {
                GET: {
                    handler: 'number.add'
                }
            },
            '/subtract/:num1/:num2': {
                GET: 'number.subtract'
            }
        }
    });
};
