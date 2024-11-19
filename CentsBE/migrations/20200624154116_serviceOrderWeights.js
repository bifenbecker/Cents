exports.up = function (knex) {
    return knex.schema.createTable('serviceOrderWeights', function (table) {
        table.increments('id');
        table.integer('referenceItemId').notNullable();
        table.foreign('referenceItemId').references('id').inTable('referenceItems');
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.integer('step');
        table.float('totalWeight', 6, 2).notNullable();
        table.float('chargeableWeight', 6, 2).notNullable();
        table.string('status');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceOrderWeights');
};
