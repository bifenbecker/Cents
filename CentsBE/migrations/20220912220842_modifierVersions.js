const MODIFIER_VERSIONS_TABLE_NAME = 'modifierVersions';

exports.up = function (knex) {
    return knex.schema.createTable(MODIFIER_VERSIONS_TABLE_NAME, function (table) {
        table.increments('id');
        table.integer('modifierId').notNullable(),
            table.foreign('modifierId').references('id').inTable('modifiers');
        table.string('name');
        table.text('description');
        table.float('price', 6, 2);
        table.enum('pricingType', ['FIXED_PRICE', 'PER_POUND']).defaultTo('PER_POUND');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists(MODIFIER_VERSIONS_TABLE_NAME);
};
