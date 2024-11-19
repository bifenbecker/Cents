exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('services')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('services').insert([
                { id: 1, service: 'Wash & Fold' },
                { id: 2, service: 'Customer Service' },
                { id: 3, service: 'Promo Redemption' },
                { id: 4, service: 'Service Tickets' },
                { id: 5, service: 'Technical Test' },
                { id: 6, service: 'washDryBag' },
            ]);
        });
};
