const StoreQuery = require('../../queryHelpers/store');
const BusinessCustomerQuery = require('../../queryHelpers/businessCustomerQuery');

async function setBusinessCustomer(req, res, next) {
    try {
        const store = new StoreQuery(req.params.storeId);
        const storeDetails = await store.details();
        const businessCustomer = new BusinessCustomerQuery(
            req.currentCustomer.id,
            storeDetails.businessId,
        );
        req.constants = {};
        req.constants.businessCustomer = await businessCustomer.details();
        next();
    } catch (error) {
        next(error);
    }
}
module.exports = exports = setBusinessCustomer;
