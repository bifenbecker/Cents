const BusinessCustomer = require('../models/businessCustomer');

class BusinessCustomerQuery {
    constructor(centsCustomerId, businessId) {
        this.centsCustomerId = centsCustomerId;
        this.businessId = businessId;
    }

    async getCommercialCustomer() {
        const businessCustomer = await BusinessCustomer.query()
            .where({
                centsCustomerId: this.centsCustomerId,
                isCommercial: true,
                businessId: this.businessId,
            })
            .whereNot('commercialTierId', null)
            .first();

        return businessCustomer;
    }

    async details() {
        const businessCustomerDetails = await BusinessCustomer.query().findOne({
            centsCustomerId: this.centsCustomerId,
            businessId: this.businessId,
        });
        return businessCustomerDetails;
    }
}

module.exports = exports = BusinessCustomerQuery;
