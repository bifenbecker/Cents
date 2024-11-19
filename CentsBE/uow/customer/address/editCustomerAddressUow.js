const CentsCustomerAddress = require('../../../models/centsCustomerAddress');
const eventEmitter = require('../../../config/eventEmitter');

/**
 * Create the CentsCustomerAddress model using incoming data
 *
 * @param {Object} payload
 */
async function editCustomerAddress(payload) {
    try {
        const newPayload = payload;
        const addressObject = newPayload.address;
        const { transaction } = newPayload;

        const customerAddress = await CentsCustomerAddress.query(transaction)
            .patch({
                centsCustomerId: newPayload.centsCustomerId,
                address1: addressObject.address1,
                address2: addressObject.address2 ? addressObject.address2 : null,
                city: addressObject.city,
                firstLevelSubdivisionCode: addressObject.firstLevelSubdivisionCode,
                postalCode: addressObject.postalCode,
                countryCode: 'US',
                googlePlacesId: newPayload.googlePlacesId ? newPayload.googlePlacesId : null,
            })
            .findById(newPayload.customerAddressId)
            .returning('*');

        newPayload.customerAddress = customerAddress;
        eventEmitter.emit('customerAddressCreated', customerAddress);

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = editCustomerAddress;
