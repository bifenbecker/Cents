exports.up = function (knex) {
    return knex.schema.createTable('partnerSubsidiaries', function (table) {
        table.increments('id');
        table.integer('partnerEntityId').notNullable();
        table.foreign('partnerEntityId').references('id').inTable('partnerEntities');
        table.string('name').notNullable();
        table.string('type').notNullable();
        table.string('logoUrl');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('partnerSubsidiaries');
};
