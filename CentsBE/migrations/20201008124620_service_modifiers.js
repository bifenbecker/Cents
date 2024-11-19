exports.up = function (knex) {
    return knex.schema.createTable('serviceModifiers', function (table) {
        table.increments('id');
        table.integer('modifierId').notNullable();
        table.foreign('modifierId').references('id').inTable('modifiers');
        table.integer('serviceId').notNullable();
        table.foreign('serviceId').references('id').inTable('servicesMaster');
        table.boolean('isFeatured').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceModifiers');
};
