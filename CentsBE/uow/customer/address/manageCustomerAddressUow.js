const CentsCustomerAddress = require('../../../models/centsCustomerAddress');
const permittedParams = require('../../../utils/permittedParams');
const eventEmitter = require('../../../config/eventEmitter');

async function manageCustomerAddress(payload) {
    try {
        const { centsCustomerId, customerAddressPayload, transaction } = payload;
        const newPayload = payload;

        const customerAddress = await CentsCustomerAddress.query(transaction)
            .where('centsCustomerId', centsCustomerId)
            .andWhere('googlePlacesId', customerAddressPayload.googlePlacesId)
            .first();

        if (customerAddress) {
            const customerAddressDetails = permittedParams(customerAddressPayload, [
                'address2',
                'instructions',
                'leaveAtDoor',
            ]);
            const centsCustomerAddress = await CentsCustomerAddress.query(transaction)
                .patch(customerAddressDetails)
                .where('centsCustomerId', centsCustomerId)
                .andWhere('googlePlacesId', customerAddressPayload.googlePlacesId)
                .first()
                .returning('*');
            newPayload.centsCustomerAddress = centsCustomerAddress;
        } else {
            const customerAddressDetails = permittedParams(customerAddressPayload, [
                'address1',
                'address2',
                'city',
                'firstLevelSubdivisionCode',
                'postalCode',
                'countryCode',
                'googlePlacesId',
                'instructions',
                'leaveAtDoor',
            ]);
            const centsCustomerAddress = await CentsCustomerAddress.query(transaction)
                .insert({ ...customerAddressDetails, centsCustomerId })
                .returning('*');
            newPayload.centsCustomerAddress = centsCustomerAddress;
        }

        eventEmitter.emit('customerAddressCreated', newPayload.centsCustomerAddress);

        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = manageCustomerAddress;
