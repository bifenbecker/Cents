const CentsCustomerAddress = require('../../../models/centsCustomerAddress');

const getCentsCustomerAndAddressUow = async (payload) => {
    try {
        const { transaction, centsCustomerAddressId } = payload;

        const centsCustomerAndCustomerAddress = await CentsCustomerAddress.query(transaction)
            .withGraphJoined('customer')
            .findById(centsCustomerAddressId)
            .first();
        return {
            address: centsCustomerAndCustomerAddress,
            customer: centsCustomerAndCustomerAddress.customer,
        };
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = getCentsCustomerAndAddressUow;
