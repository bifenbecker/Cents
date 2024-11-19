const CentsCustomerAddress = require('../../../models/centsCustomerAddress');

/**
 * Add the delivery instructions to the CentsCustomerAddress
 *
 * @param {Object} payload
 */
async function editCustomerAddress(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const customerAddress = await CentsCustomerAddress.query(transaction)
            .patch({
                instructions: newPayload.instructions,
                leaveAtDoor: newPayload.leaveAtDoor,
            })
            .findById(newPayload.customerAddressId)
            .returning('*');

        newPayload.customerAddress = customerAddress;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = editCustomerAddress;
