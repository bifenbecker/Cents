exports.up = function (knex) {
    return knex.schema.hasTable('orderItems').then(function (exists) {
        if (exists) {
            return knex.schema.renameTable('orderItems', 'serviceOrderItems');
        } else {
            return null;
        }
    });
};

exports.down = function (knex) {
    return knex.schema.hasTable('serviceOrderItems').then(function (exists) {
        if (exists) {
            return knex.schema.renameTable('serviceOrderItems', 'orderItems');
        } else {
            return null;
        }
    });
};
