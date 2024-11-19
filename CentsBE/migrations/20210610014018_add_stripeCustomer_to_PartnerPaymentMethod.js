exports.up = function (knex) {
    return knex.schema.table('partnerSubsidiaryPaymentMethods', function (table) {
        table.string('partnerStripeCustomerId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('partnerSubsidiaries', function (table) {
        table.dropColumn('partnerSubsidiaryPaymentMethods');
    });
};
