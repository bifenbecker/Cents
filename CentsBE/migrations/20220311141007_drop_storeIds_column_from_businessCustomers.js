exports.up = function (knex) {
    return knex.schema.table('businessCustomers', function (table) {
        table.dropColumn('storeIds');
    });
};

exports.down = function (knex) {
    return knex.schema.table('businessCustomers', function (table) {
        table.specificType('storeIds', 'INT[]');
    });
};
