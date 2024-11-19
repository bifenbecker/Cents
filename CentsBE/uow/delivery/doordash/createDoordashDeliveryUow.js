// packages
const axios = require('axios');
const phone = require('phone');

// models
const ServiceOrderItem = require('../../../models/serviceOrderItem');
const ServiceOrderBag = require('../../../models/serviceOrderBags');

// utils / shared functions
const { setPickupAndDropoffAddresses } = require('../../../routes/live-link/doordash/utils');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Determine the proper weight to record based on line item category and delivery type
 *
 * @param {Object} item
 * @param {String} type
 */
function determineItemWeight(item, type) {
    let weight = null;

    if (item.category === 'PER_POUND' && type === 'PICKUP') {
        weight = 30;
    } else if (item.category === 'PER_POUND' && type === 'RETURN') {
        weight = item.lineItemQuantity;
    } else {
        weight = 1;
    }

    return weight;
}

/**
 * Generate line items for DoorDash based on the ServiceOrder
 *
 * @param {Object} serviceOrder
 * @param {void} transaction
 * @param {Number} bagCount
 * @param {String} type
 */
async function generateDoorDashLineItems(serviceOrder, transaction, bagCount = null, type) {
    let finalBagCount;

    const serviceOrderItems = await ServiceOrderItem.query(transaction)
        .withGraphFetched('referenceItems.[lineItemDetail]')
        .where({
            orderId: serviceOrder.id,
            deletedAt: null,
        });

    if (!bagCount) {
        const bags = await ServiceOrderBag.query(transaction).where({
            serviceOrderId: serviceOrder.id,
        });
        finalBagCount = bags.length;
    } else {
        finalBagCount = bagCount;
    }

    const referenceItems = serviceOrderItems.map((item) => item.referenceItems);
    const lineItems = referenceItems.map((item) => item[0].lineItemDetail);
    const filteredLineItems = lineItems.filter((item) => item.soldItemType !== 'Modifier');

    const formattedLineItems = filteredLineItems.map((item) => ({
        name: item.lineItemName,
        description: item.lineItemDescription,
        quantity: item.pricingType === 'PER_POUND' ? finalBagCount : item.lineItemQuantity,
        weight: determineItemWeight(item, type),
        external_id: serviceOrder.id,
        volume: 27,
    }));

    return formattedLineItems;
}

/**
 * Validate inputs for DoorDash delivery to confirm deliverability
 *
 * Incoming parameters available:
 *
 * 1) storeId
 * 2) servicePriceId
 * 3) serviceModifierIds
 * 4) customerNotes
 * 5) orderNotes
 * 6) pickupAddressId
 * 7) orderDelivery
 *    - type, deliveryProvider, deliveryWindow, thirdPartyDeliveryId (estimate id), timingsId
 * 8) paymentToken
 * 9) promoCode
 *
 * @param {Object} payload
 */
async function createDoorDashDelivery(payload) {
    try {
        const newPayload = payload;
        const {
            transaction,
            serviceOrder,
            address,
            fullStore,
            customer,
            orderDelivery,
            deliveryTip,
            bagCount,
        } = newPayload;
        const { type, deliveryWindow, deliveryProvider } = orderDelivery;
        const tipToBeAdded = deliveryTip || 0;

        if (deliveryProvider === 'OWN_DRIVER') {
            return newPayload;
        }

        const [pickupAddress, dropoffAddress] = setPickupAndDropoffAddresses(
            fullStore,
            address,
            type,
        );
        const phoneNumber = phone(customer.phoneNumber, '', true);
        const formattedPhoneNumber = phoneNumber[0];

        const lineItems = await generateDoorDashLineItems(
            serviceOrder,
            transaction,
            bagCount,
            type,
        );

        const params = {
            pickup_address: pickupAddress,
            pickup_phone_number: formattedPhoneNumber,
            dropoff_address: dropoffAddress,
            customer: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                email: customer.emailAddress || 'developer@trycents.com',
                phone_number: formattedPhoneNumber,
                should_send_notifications: false,
            },
            order_value: Math.round(Number(serviceOrder.netOrderTotal * 100)) || 3000,
            tip: Math.round(Number(tipToBeAdded * 100)),
            items: lineItems,
            allowed_vehicles: ['car'],
        };

        if (type === 'RETURN') {
            params.external_store_id = fullStore.id;
            params.delivery_time = new Date(Number(deliveryWindow[0]));
            params.dropoff_instructions = address.instructions;
            params.pickup_business_name = fullStore.name;
            params.external_business_name = 'Cents Laundromat';
        } else {
            params.pickup_time = new Date(Number(deliveryWindow[0]));
            params.dropoff_instructions = `Please tell the laundromat that this is a Cents laundry order for ${customer.firstName} ${customer.lastName} and to please confirm the order on the Cents employee app.`;
            params.pickup_instructions = `RESIDENTIAL OR HOTEL PICKUP. Call ${customer.firstName} ${customer.lastName} when you arrive to pick up their Cents laundry order at ${formattedPhoneNumber}.`;
            params.pickup_business_name = 'Pick Up from Customer Address';
            params.external_business_name = 'Pick Up from Customer Address';
        }

        LoggerHandler('info', `DoorDash order payload for ${serviceOrder.id}`, params);

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
        };

        const url = `${process.env.DOORDASH_API_URL}deliveries`;
        const response = await axios.post(url, params, {
            headers,
        });

        const data = await response.data;

        LoggerHandler('info', `DoorDash order response for ${serviceOrder.id}`, data);

        newPayload.thirdPartyDelivery = data;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'DoorDash create order UoW failure', error);
        throw Error(error.message);
    }
}

module.exports = exports = createDoorDashDelivery;
