exports.up = function (knex) {
    return knex.schema.createTable('partnerEntities', function (table) {
        table.increments('id');
        table.string('name').notNullable();
        table.string('logoUrl');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('partnerEntities');
};
