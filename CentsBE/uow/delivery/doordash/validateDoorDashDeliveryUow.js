// packages
const axios = require('axios');
const phone = require('phone');

// models
const Store = require('../../../models/store');

// utils / shared functions
const { setPickupAndDropoffAddresses } = require('../../../routes/live-link/doordash/utils');

/**
 * Validate inputs for DoorDash delivery to confirm deliverability
 *
 * @param {Object} payload
 */
async function validateDoorDashDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder, address, store, customer, orderDelivery, deliveryTip } =
            newPayload;
        const { type, deliveryWindow, deliveryProvider } = orderDelivery;
        const tipToBeAdded = deliveryTip || 0;

        if (deliveryProvider === 'OWN_DRIVER') {
            return newPayload;
        }

        const fullStoreModel = await Store.query(transaction).findById(store.id);

        const [pickupAddress, dropoffAddress] = setPickupAndDropoffAddresses(
            fullStoreModel,
            address,
            type,
        );
        const phoneNumber = phone(customer.phoneNumber, '', true);
        const formattedPhoneNumber = phoneNumber[0];

        const params = {
            pickup_address: pickupAddress,
            pickup_phone_number: formattedPhoneNumber,
            dropoff_address: dropoffAddress,
            customer: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                email: customer.emailAddress || 'developer@trycents.com',
                phone_number: formattedPhoneNumber,
            },
            order_value: Math.round(Number(serviceOrder.netOrderTotal * 100)) || 3000,
            external_business_name: 'Make Cents Technologies, Inc.',
            tip: Math.round(Number(tipToBeAdded * 100)),
        };

        if (type === 'RETURN') {
            params.external_store_id = store.id;
            params.delivery_time = new Date(Number(deliveryWindow[0]));
            params.dropoff_instructions = address.instructions;
            params.pickup_business_name = fullStoreModel.name;
        } else {
            params.pickup_time = new Date(Number(deliveryWindow[0]));
            params.dropoff_instructions = `Please tell the laundromat that this is a Cents laundry order for ${customer.firstName} ${customer.lastName} and to please confirm the order on the Cents employee app.`;
            params.pickup_instructions = `RESIDENTIAL OR HOTEL PICKUP. Call ${customer.firstName} ${customer.lastName} when you arrive to pick up their Cents laundry order at ${formattedPhoneNumber}.`;
            params.pickup_business_name = 'RESIDENTIAL ADDRESS';
        }

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
        };

        const url = `${process.env.DOORDASH_API_URL}validations`;
        const response = await axios.post(url, params, {
            headers,
        });

        const data = await response.data;
        newPayload.thirdPartyDeliveryValidation = data;
        newPayload.fullStore = fullStoreModel;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = validateDoorDashDelivery;
