exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('machinePaymentType')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('machinePaymentType').insert([
                {
                    id: 1,
                    type: 'COIN',
                },
                {
                    id: 2,
                    type: 'APP',
                },
                {
                    id: 3,
                    type: 'EMV',
                },
                {
                    id: 4,
                    type: 'CLOUD',
                },
                {
                    id: 5,
                    type: 'IN-APP',
                },
            ]);
        });
};
