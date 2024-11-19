exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('machineModelLoads')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('machineModelLoads').insert([
                {
                    id: 1,
                    modelId: 1,
                    loadId: 1,
                },
                {
                    id: 2,
                    modelId: 1,
                    loadId: 2,
                },
                {
                    id: 3,
                    modelId: 2,
                    loadId: 1,
                },
                {
                    id: 4,
                    modelId: 3,
                    loadId: 2,
                },
                {
                    id: 5,
                    modelId: 4,
                    loadId: 3,
                },
                {
                    id: 6,
                    modelId: 3,
                    loadId: 1,
                },
            ]);
        });
};
