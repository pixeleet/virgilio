module.exports = function(options) {
    var virgilio = this;
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    virgilio.defineAction('salad.getRandom', function(request) {
        var virgilio = this;
        return virgilio.execute('fruit.findAll')
            .map(function(fruit) {
                return {
                    fruit: fruit,
                    amount: getRandomInt(0, 10)
                };
            });
    });
};
