exports.up = function (knex) {
    return knex.schema.createTable('weightLog', function (table) {
        table.increments('id');
        table.integer('orderId').notNullable();
        table.foreign('orderId').references('id').inTable('orders');
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.float('totalWeight', 6, 2).notNullable();
        table.integer('step').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('weightLog');
};
