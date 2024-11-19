exports.up = function (knex) {
    return knex.schema.createTable('bagNoteTags', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('name').notNullable();
        table.string('isDeleted').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('bagNoteTags');
};
