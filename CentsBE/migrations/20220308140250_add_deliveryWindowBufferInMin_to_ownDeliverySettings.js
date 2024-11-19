exports.up = function (knex) {
    return knex.schema.table('ownDeliverySettings', (table) => {
        table.double('deliveryWindowBufferInHours').defaultTo(0.5);
    });
};

exports.down = function (knex) {
    return knex.schema.table('ownDeliverySettings', (table) => {
        table.dropColumn('deliveryWindowBufferInHours');
    });
};
