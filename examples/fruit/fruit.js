module.exports = function(options) {
    var virgilio = this;
    var fruits = [ 'apple', 'pear', 'banana', 'melon' ];

    virgilio.namespace('fruit')
        .defineAction('findAll', function() {
            this.log.info('Searching for fruits...');
            return fruits.slice(0);
        })
        .defineAction('find', function(fruitId) {
            var fruit = fruits[fruitId];
            if (!fruit) {
                throw new Error('No fruit with index: ' + fruitId);
            }
            return fruit;
        })
        .defineAction('create', function(fruit) {
            if (fruits.indexOf(fruit) === -1) {
                fruits.push(fruit);
            }
        })
        .defineAction('delete', function(fruit) {
            var fruitIndex = fruits.indexOf(fruit);
            if (fruitIndex === -1) {
                throw 'fruit `' + fruit + '` does not exist';
            }
            delete fruits[fruitIndex];
        });
};
