const CentsCustomerAddress = require('../../../models/centsCustomerAddress');
const eventEmitter = require('../../../config/eventEmitter');

/**
 * Create the CentsCustomerAddress model using incoming data
 *  or returns existing customerAddress data if address.id was provided (TO DO refactor this indirection)
 * @param {Object} payload
 */
async function createCustomerAddress(payload) {
    try {
        const newPayload = payload;
        const addressObject = newPayload.address;
        const { transaction } = newPayload;
        let customerAddress = null;

        if (addressObject.id) {
            customerAddress = await CentsCustomerAddress.query(transaction).findById(
                addressObject.id,
            );
        } else {
            customerAddress = await CentsCustomerAddress.query(transaction)
                .insert({
                    centsCustomerId: newPayload.centsCustomerId,
                    address1: addressObject.address1,
                    address2: addressObject.address2 ? addressObject.address2 : null,
                    city: addressObject.city,
                    firstLevelSubdivisionCode: addressObject.firstLevelSubdivisionCode,
                    postalCode: addressObject.postalCode,
                    countryCode: 'US',
                    googlePlacesId: newPayload.googlePlacesId ? newPayload.googlePlacesId : null,
                })
                .returning('*');
            eventEmitter.emit('customerAddressCreated', customerAddress);
        }

        newPayload.customerAddress = customerAddress;
        newPayload.centsCustomerAddressId = customerAddress.id;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createCustomerAddress;
