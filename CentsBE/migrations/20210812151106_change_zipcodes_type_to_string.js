exports.up = function (knex) {
    return knex.schema.alterTable('zones', function (table) {
        table.specificType('zipCodes', 'text[]').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('zones', function (table) {
        table.specificType('zipCodes', 'int[]').alter();
    });
};
