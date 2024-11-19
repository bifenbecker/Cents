exports.up = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.renameColumn('firstLevelSubdivisonCode', 'firstLevelSubdivisionCode');
    });
};

exports.down = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.renameColumn('firstLevelSubdivisionCode', 'firstLevelSubdivisonCode');
    });
};
