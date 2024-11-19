exports.up = function (knex) {
    return knex.schema.table('partnerSubsidiaries', function (table) {
        table.integer('subsidiaryCode');
    });
};

exports.down = function (knex) {
    return knex.schema.table('partnerSubsidiaries', function (table) {
        table.dropColumn('subsidiaryCode');
    });
};
