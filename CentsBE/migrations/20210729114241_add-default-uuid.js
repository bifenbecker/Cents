exports.up = async function (knex) {
    return Promise.all([
        knex.schema.alterTable('serviceOrders', function (table) {
            table.uuid('uuid').defaultTo(knex.raw('uuid_generate_v4()')).alter();
        }),
        knex.schema.alterTable('inventoryOrders', function (table) {
            table.uuid('uuid').defaultTo(knex.raw('uuid_generate_v4()')).alter();
        }),
    ]);
};

exports.down = async function (knex) {
    return Promise.all([
        knex.schema.alterTable('serviceOrders', function (table) {
            table.uuid('uuid').defaultTo(null).alter();
        }),
        knex.schema.alterTable('inventoryOrders', function (table) {
            table.uuid('uuid').defaultTo(null).alter();
        }),
    ]);
};
