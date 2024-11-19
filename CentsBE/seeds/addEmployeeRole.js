exports.seed = function (knex) {
    return knex('roles').insert([
        {
            id: 3,
            userType: 'Employee',
        },
        {
            id: 4,
            userType: 'Business Admin',
        },
        {
            id: 5,
            userType: 'Business Manager',
        },
    ]);
};
