exports.up = function (knex) {
    return knex.schema.createTable('partnerSubsidiaryStores', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('partnerSubsidiaryId').notNullable();
        table.foreign('partnerSubsidiaryId').references('id').inTable('partnerSubsidiaries');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('partnerSubsidiaryStores');
};
