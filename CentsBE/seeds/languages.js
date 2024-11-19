exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('languages')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('languages').insert([
                { id: 1, language: 'english' },
                { id: 2, language: 'spanish' },
            ]);
        });
};
