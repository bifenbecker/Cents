const CentsCustomerAddress = require('../../../models/centsCustomerAddress');

async function deleteCustomerAddress(payload) {
    try {
        const { id, transaction } = payload;
        const deletedAddress = await CentsCustomerAddress.query(transaction)
            .patch({
                deletedAt: new Date().toISOString(),
            })
            .findById(id)
            .returning('*');

        return deletedAddress;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = deleteCustomerAddress;
