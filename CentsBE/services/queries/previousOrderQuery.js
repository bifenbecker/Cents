const CustomQuery = require('../customQuery');

class PreviousOrderQuery {
    constructor(customerId, postalCode, businessId) {
        this.customerId = customerId;
        this.postalCode = postalCode;
        this.businessId = businessId;
    }

    async run() {
        const query = new CustomQuery('previousOrder.sql', {
            customerId: this.customerId,
            postalCode: this.postalCode,
            businessId: this.businessId,
        });
        const rows = await query.execute();
        return rows;
    }
}

module.exports = PreviousOrderQuery;
