exports.up = function (knex) {
    return knex.schema.table('users', function (table) {
        table.string('otp');
        table.datetime('otpGeneratedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
        table.dropColumn('otp');
        table.dropColumn('otpGeneratedAt');
    });
};
