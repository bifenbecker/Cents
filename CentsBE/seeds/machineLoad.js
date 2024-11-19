exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('machineLoadTypes')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('machineLoadTypes').insert([
                {
                    id: 1,
                    name: 'Warm',
                },
                {
                    id: 2,
                    name: 'Cold',
                },
                {
                    id: 3,
                    name: 'Hot',
                },
            ]);
        });
};
