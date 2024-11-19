exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('prices')
        .del()
        .then(function () {
            // Inserts seed entries
            return knex('prices').insert([
                {
                    id: 1,
                    storeId: 1,
                    laundryTypeId: 1,
                    price: 7,
                },
                // {
                //   id: 2,
                //   storeId: 1,
                //   laundryTypeId: 2,
                //   price: 5,
                // },
                // {
                //   id: 3,
                //   storeId: 1,
                //   laundryTypeId: 3,
                //   price: 6,
                // },
                // {
                //   id: 4,
                //   storeId: 1,
                //   laundryTypeId: 4,
                //   price: 7,
                // },
                // {
                //   id: 5,
                //   storeId: 2,
                //   laundryTypeId: 1,
                //   price: 1,
                // },
                // {
                //   id: 6,
                //   storeId: 2,
                //   laundryTypeId: 2,
                //   price: 5,
                // },
                // {
                //   id: 7,
                //   storeId: 2,
                //   laundryTypeId: 3,
                //   price: 6,
                // },
                // {
                //   id: 8,
                //   storeId: 2,
                //   laundryTypeId: 4,
                //   price: 7,
                // },
            ]);
        });
};
