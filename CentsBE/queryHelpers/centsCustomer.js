const RecurringSubscription = require('../models/recurringSubscription');

async function subscriptions(id, trx, storeIds) {
    return RecurringSubscription.query(trx)
        .withGraphJoined('[store.settings,address]')
        .where({
            'recurringSubscriptions.centsCustomerId': id,
            'recurringSubscriptions.deletedAt': null,
        })
        .where((query) => {
            if (storeIds && storeIds.length) {
                query.whereIn(`${RecurringSubscription.tableName}.storeId`, storeIds);
            }
        })
        .orderBy(`${RecurringSubscription.tableName}.createdAt`, 'desc');
}

async function getSubscription(id, trx) {
    return RecurringSubscription.query(trx)
        .withGraphJoined('[store.settings,address]')
        .findById(id);
}

module.exports = exports = {
    subscriptions,
    getSubscription,
};
