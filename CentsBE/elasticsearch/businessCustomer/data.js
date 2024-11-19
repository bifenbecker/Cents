const CustomQuery = require('../../services/customQuery');

async function getBusinessCustomerDataToIndex(businessCustomerId) {
    const customQueryObject = new CustomQuery('es-businessCustomer-data.sql', {
        businessCustomerId,
    });
    return customQueryObject.execute();
}

module.exports = exports = { getBusinessCustomerDataToIndex };
