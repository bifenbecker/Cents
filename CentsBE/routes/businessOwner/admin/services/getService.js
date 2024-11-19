const ServicesMaster = require('../../../../models/services');

async function getServiceQuery(id) {
    const where = {};
    where[`${ServicesMaster.tableName}.id`] = id;
    where[`${ServicesMaster.tableName}.deletedAt`] = null;
    const service = await ServicesMaster.query()
        .eagerAlgorithm(ServicesMaster.JoinEagerAlgorithm)
        .eager('prices(notDeleted).[store(storeName)]', {
            storeName: (query) => {
                query.select('name');
            },
            notDeleted: (query) => {
                query.where('deletedAt', null);
            },
        })
        .orderBy('prices:store.name', 'asc')
        .findOne(where);
    return service;
}
module.exports = exports = getServiceQuery;
