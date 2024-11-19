exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('detergentTypes')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('detergentTypes').insert([
                { id: 1, detergentType: 'Regular' },
                { id: 2, detergentType: 'Hypoallergenic' },
            ]);
        });
};
