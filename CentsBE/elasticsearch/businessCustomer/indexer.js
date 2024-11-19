const client = require('..');
const { getBusinessCustomerDataToIndex } = require('./data');

async function indexBusinessCustomer(businessCustomerId) {
    const [businessCustomer] = await getBusinessCustomerDataToIndex(businessCustomerId);
    if (!businessCustomer) {
        return;
    }
    await client.index({
        index: `${process.env.ENV_NAME}_business_customers`,
        id: businessCustomerId,
        body: {
            id: businessCustomerId,
            ...businessCustomer,
        },
        refresh: 'true',
    });
}

module.exports = {
    indexBusinessCustomer,
};
