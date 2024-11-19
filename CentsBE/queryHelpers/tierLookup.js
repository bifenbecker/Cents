const ServiceOrder = require('../models/serviceOrders');
const BusinessCustomerQuery = require('./businessCustomerQuery');

class TierLookup {
    constructor(serviceOrderId, centsCustomerId, businessId) {
        this.serviceOrderId = serviceOrderId;
        this.centsCustomerId = centsCustomerId;
        this.businessId = businessId;
    }

    async tierId() {
        if (this.serviceOrderId) {
            const serviceOrder = await this.serviceOrder();
            return serviceOrder ? serviceOrder.tierId : null;
        }
        if (this.centsCustomerId) {
            const query = new BusinessCustomerQuery(this.centsCustomerId, this.businessId);
            const CommercialCustomer = await query.getCommercialCustomer();
            return CommercialCustomer ? CommercialCustomer.commercialTierId : null;
        }
        return null;
    }

    async serviceOrder() {
        const serviceOrder = await ServiceOrder.query()
            .select('tierId', 'storeId')
            .findById(this.serviceOrderId);
        return serviceOrder;
    }
}
module.exports = exports = TierLookup;
