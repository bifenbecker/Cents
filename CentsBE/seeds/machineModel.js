exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('machineModels')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('machineModels').insert([
                {
                    id: 1,
                    modelName: 'T900',
                    capacity: '15LB',
                    manufacturer: 'LG',
                    typeId: 1,
                },
                {
                    id: 2,
                    modelName: 'T800',
                    capacity: '20LB',
                    manufacturer: 'Dexter',
                    typeId: 2,
                },
                {
                    id: 3,
                    modelName: 'T600',
                    capacity: '25LB',
                    manufacturer: 'Philips',
                    typeId: 1,
                },
                {
                    id: 4,
                    modelName: 'T500',
                    capacity: '35LB',
                    manufacturer: 'Godrej',
                    typeId: 2,
                },
            ]);
        });
};
