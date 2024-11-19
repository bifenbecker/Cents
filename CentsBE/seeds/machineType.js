const uuidv4 = require('uuid/v4');
exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('machineTypes')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('machineTypes').insert([
                {
                    id: 1,
                    name: 'WASHER',
                },
                {
                    id: 2,
                    name: 'DRYER',
                },
            ]);
        });
};
