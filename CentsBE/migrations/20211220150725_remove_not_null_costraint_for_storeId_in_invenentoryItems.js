
exports.up = function(knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        table.integer('storeId').nullable().alter();
    }) 
};

exports.down = function(knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        table.integer('storeId').notNullable().alter();;
    })  
};
