const {
    getServicePrices,
    importData,
    syncServicePricesObject,
} = require('../lib/servicesModuleDataMigrationUtils');
exports.up = async function (knex) {
    const result = await getServicePrices();
    const serviceCategories = await importData(result);
    const syncServiceData = await syncServicePricesObject({ isDeleted: false });
    const syncDeletedServiceData = await syncServicePricesObject({
        isDeleted: true,
    });
};

exports.down = function (knex) {
    return knex('referenceItems')
        .update({
            serviceId: null,
        })
        .then(() => {
            return knex('referenceItems').update({
                servicePriceId: null,
            });
        })
        .then(() => {
            return knex('servicePrices').del();
        })
        .then(() => {
            return knex('servicesMaster').del();
        })
        .then(() => {
            return knex('serviceCategories').del();
        });
};
