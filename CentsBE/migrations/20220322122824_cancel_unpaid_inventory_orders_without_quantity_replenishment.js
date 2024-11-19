const cancelUnpaidInventoryOrders = require('../workers/orders/cancelUnpaidInventoryOrders');

exports.up = async function (knex) {
    await cancelUnpaidInventoryOrders({ replenishInventory: false });
};

exports.down = function (knex) {
    return;
};
