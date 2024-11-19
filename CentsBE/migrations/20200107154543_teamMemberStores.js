exports.up = function (knex) {
    return knex.schema.createTable('teamMemberStores', function (table) {
        table.increments('id');
        table.integer('teamMemberId').notNullable();
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('teamMemberStores');
};
