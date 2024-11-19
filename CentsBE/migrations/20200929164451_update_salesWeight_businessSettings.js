exports.up = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.string('salesWeight').defaultTo('DURING_INTAKE').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.string('salesWeight').defaultTo(null).alter();
    });
};
