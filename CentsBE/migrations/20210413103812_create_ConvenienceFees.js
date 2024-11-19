exports.up = function (knex) {
    return knex.schema.createTable('convenienceFees', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.float('fee').notNullable();
        table.string('feeType').notNullable().defaultTo('PERCENTAGE');
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('convenienceFees');
};
