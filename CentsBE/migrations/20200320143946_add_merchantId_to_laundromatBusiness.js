exports.up = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.string('merchantId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.dropColumn('merchantId');
    });
};
