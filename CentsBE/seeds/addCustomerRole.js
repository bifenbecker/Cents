exports.seed = function (knex) {
    return knex('roles').insert([
        {
            id: 6,
            userType: 'Customer',
        },
    ]);
};
