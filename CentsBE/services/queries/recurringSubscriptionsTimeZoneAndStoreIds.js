const CustomQuery = require('../customQuery');

class RecurringSubscriptionsTimeZoneAndStoreIds {
    async run() {
        const query = new CustomQuery('getRecurringSubscriptionTimeZoneWithStoreIds.sql');
        const rows = await query.execute();
        return rows;
    }
}

module.exports = RecurringSubscriptionsTimeZoneAndStoreIds;
