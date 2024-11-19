exports.up = function (knex) {
    return knex.schema.createTable('serviceOrderBags', function (table) {
        table.increments('id');
        table.integer('serviceOrderId').notNullable();
        table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        table.string('description');
        table.string('barcode');
        table.string('barcodeStatus');
        table.boolean('isActiveBarcode').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceOrderBags');
};
