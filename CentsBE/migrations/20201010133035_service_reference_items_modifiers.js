exports.up = function (knex) {
    return knex.schema.createTable('serviceReferenceItemModifiers', function (table) {
        table.increments('id');
        table.integer('serviceReferenceItemId').notNullable();
        table.foreign('serviceReferenceItemId').references('id').inTable('serviceReferenceItems');
        table.integer('serviceModifierId').notNullable();
        table.foreign('serviceModifierId').references('id').inTable('serviceModifiers');
        table.string('modifierName');
        table.float('modifierPrice', 6, 2);
        table.text('modifierDescription');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceReferenceItemModifiers');
};
