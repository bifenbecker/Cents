const CentsCustomer = require('../../../models/centsCustomer');
const CentsCustomerAddress = require('../../../models/centsCustomerAddress');
const PreviousOrderQuery = require('../../queries/previousOrderQuery');

async function findCustomer(phoneNumber, transaction) {
    const isCustomer = await CentsCustomer.query(transaction)
        .select(
            'centsCustomers.firstName as firstName',
            'centsCustomers.lastName as lastName',
            'centsCustomers.id as centsCustomerId',
            'centsCustomers.phoneNumber as phoneNumber',
        )
        .leftJoin('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
        .where('storeCustomers.phoneNumber', phoneNumber)
        .orWhere('centsCustomers.phoneNumber', phoneNumber)
        .limit(1)
        .first();
    return isCustomer;
}

async function getCustomerAddress(centsCustomerId, addressId, transaction) {
    const customerAddress = await CentsCustomerAddress.query(transaction).findOne({
        id: addressId,
        centsCustomerId,
    });
    return customerAddress;
}

async function getCustomerLastOrder(customerId, postalCode, businessId) {
    const order = await new PreviousOrderQuery(customerId, postalCode, businessId).run();
    return order[0];
}

module.exports = exports = {
    findCustomer,
    getCustomerAddress,
    getCustomerLastOrder,
};
