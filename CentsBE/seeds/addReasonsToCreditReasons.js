exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('creditReasons')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('creditReasons').insert([
                {
                    id: 1,
                    reason: 'Customer Service',
                },
            ]);
        });
};
