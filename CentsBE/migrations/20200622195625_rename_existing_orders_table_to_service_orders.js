exports.up = function (knex) {
    return knex.schema.hasTable('orders').then(function (exists) {
        if (exists) {
            return knex.schema.renameTable('orders', 'serviceOrders');
        }
        return null;
    });
};

exports.down = function (knex) {
    return knex.schema.hasTable('serviceOrders').then(function (exists) {
        if (exists) {
            return knex.schema.renameTable('serviceOrders', 'orders');
        }
        return null;
    });
};
