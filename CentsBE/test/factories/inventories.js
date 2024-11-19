const { factory } = require('factory-girl');
const Inventory = require('../../models/inventory');
require('./inventorycategories');

factory.define('inventory', Inventory, {
    categoryId: factory.assoc('inventoryCategory', 'id'),
    productName: 'washing powder',
    quantity: 1,
    price: 10,
    description: factory.chance('word'),
});

module.exports = exports = factory;
