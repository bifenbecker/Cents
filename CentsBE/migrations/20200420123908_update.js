exports.up = function (knex) {
    return knex.schema
        .alterTable('prices', function (table) {
            table.dropForeign('laundryTypeId'); // dropForeign key constraint.
        })
        .renameTable('laundryTypes', 'washServices') // rename table.
        .alterTable('prices', function (table) {
            table.renameColumn('laundryTypeId', 'washServiceId'); // rename column.
            table.foreign('washServiceId').references('id').inTable('washServices'); // add foreign key constraint.
        });
};

exports.down = function (knex) {
    return knex.schema
        .alterTable('prices', function (table) {
            table.dropForeign('washServiceId'); // dropForeign key constraint.
            table.renameColumn('washServiceId', 'laundryTypeId'); // rename column .
        })
        .renameTable('washServices', 'laundryTypes') // rename table.
        .alterTable('prices', function (table) {
            table.foreign('laundryTypeId').references('id').inTable('laundryTypes'); // add foreign key constraint.
        });
};
