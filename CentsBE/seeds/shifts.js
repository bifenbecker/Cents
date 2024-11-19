exports.seed = function (knex) {
    return knex('shifts')
        .del()
        .then(function () {
            return knex('shifts').insert([
                {
                    id: 1,
                    name: 'shift1',
                    storeId: '1',
                },
                {
                    id: 2,
                    name: 'shift2',
                    storeId: '1',
                },
            ]);
        });
};
