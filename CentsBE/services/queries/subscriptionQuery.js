const CustomQuery = require('../customQuery');

class SubscriptionQuery {
    constructor(recurringSubscriptionId, cancelledPickupWindow) {
        this.recurringSubscriptionId = recurringSubscriptionId;
        this.cancelledPickupWindow = cancelledPickupWindow || null;
    }

    async activePickup() {
        const query = new CustomQuery('hasActivePickup.sql', {
            recurringSubscriptionId: this.recurringSubscriptionId,
            statusFilter: true,
        });
        const rows = await query.execute();
        if (rows.length) {
            return Number(rows[0].deliveryWindow[0]);
        }
        return null;
    }

    async lastPickupTime() {
        const query = new CustomQuery('hasActivePickup.sql', {
            recurringSubscriptionId: this.recurringSubscriptionId,
        });
        const rows = await query.execute();

        return Math.max(Number(rows[0].deliveryWindow[0]), Number(this.cancelledPickupWindow));
    }

    async lastOrderDetails() {
        const query = new CustomQuery('hasActivePickup.sql', {
            recurringSubscriptionId: this.recurringSubscriptionId,
        });
        const rows = await query.execute();
        return rows[0];
    }
}

module.exports = SubscriptionQuery;
