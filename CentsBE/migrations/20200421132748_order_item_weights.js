exports.up = function (knex) {
    return knex.schema.createTable('itemWeights', function (table) {
        table.increments('id');
        table.integer('orderItemId').notNullable();
        table.foreign('orderItemId').references('id').inTable('orderItems');
        table.integer('step');
        table.float('weight', 6, 2).notNullable();
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('itemWeights');
};
