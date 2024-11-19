exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('washServices')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('laundryTypes').insert([
                { id: 1, laundryType: 'Small (upto 20lbs)' },
                { id: 2, laundryType: 'Medium (21-35lbs)' },
                { id: 3, laundryType: 'Large (36-50lbs)' },
                { id: 4, laundryType: 'XL (51-75lbs) ' },
                { id: 5, laundryType: 'XXL (76-100lbs)' },
            ]);
        });
};
