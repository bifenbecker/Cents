exports.up = function (knex) {
    return knex.schema.createTable('tipSettings', function (table) {
        table.increments('id');
        table.jsonb('tipDollars');
        table.jsonb('tipPercentage');
        table.string('tipType');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('tipSettings');
};
