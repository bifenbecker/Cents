exports.up = function (knex) {
    return knex.schema.createTable('partnerSubsidiaryPaymentMethods', function (table) {
        table.increments('id');
        table.integer('partnerSubsidiaryId').notNullable();
        table.foreign('partnerSubsidiaryId').references('id').inTable('partnerSubsidiaries');
        table.string('provider').notNullable();
        table.string('type').notNullable();
        table.string('paymentMethodToken').notNullable();
        table.boolean('isDeleted').defaultTo(false);
        table.boolean('isDefault').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('partnerSubsidiaryPaymentMethods');
};
