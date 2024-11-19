exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('creditReasons').insert({
        reason: 'Order Adjustment',
    });
};
