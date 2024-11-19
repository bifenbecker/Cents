exports.up = function (knex) {
    return knex.schema.alterTable('ownDeliverySettings', function (table) {
        table.specificType('zipCodes', 'text[]').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('ownDeliverySettings', function (table) {
        table.specificType('zipCodes', 'int[]').alter();
    });
};
