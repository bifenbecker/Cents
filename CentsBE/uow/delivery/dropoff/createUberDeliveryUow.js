const axios = require('axios');
const phone = require('phone');

const Store = require('../../../models/store');
const ServiceOrder = require('../../../models/serviceOrders');
const StoreCustomer = require('../../../models/storeCustomer');
const CentsCustomer = require('../../../models/centsCustomer');

/**
 * Format individual lineItem object for uber's required key-value pairs
 *
 * Uber's required fields are name, description, quantity, price, external_id.
 *
 * Price and quantity need to be in integer formats, so for PER_POUND or Modifier items,
 * we need to format the quantity and price accordingly.
 *
 * @param {Object} lineItem
 */
async function formatIndividualLineItem(lineItem) {
    const item = {};
    const quantity =
        lineItem.category === 'PER_POUND' || lineItem.soldItemType === 'Modifier'
            ? 1
            : lineItem.lineItemQuantity;
    let price = Number(lineItem.lineItemTotalCost * 100).toFixed(2);
    price = Math.round(Number(price));

    item.name = lineItem.lineItemName;
    item.quantity = quantity;
    item.price = price;
    item.external_id = `${lineItem.id}`;

    return item;
}

/**
 * Convert the current lineItems array into an Uber-readable way
 *
 * @param {Array} lineItems
 */
async function formatOrderItems(lineItems) {
    const formattedItems = lineItems.map((item) => formatIndividualLineItem(item));

    return Promise.all(formattedItems);
}

/**
 * Make a request to create a Delivery via Uber.
 *
 * Uber requests require the following:
 *
 * 1) estimate_id: ID of the estimate used in creating the delivery.
 * 2) pickup_at: Unix timestamp in milliseconds of when the order is ready for pickup.
 *               This comes from the Uber estimate and is required to generate an estimate
 * 3) external_order_id: The ID of the order supplied by the merchant.
 *                       For us, this would most likely be the orderCode of the ServiceOrder
 *                       This is used by the delivery person at pick up and by store employees.
 * 4) order_items: array of order items being delivered
 * 4a) required objects in the order_items array include name and quantity
 * 5) order_summary: if provided, basket-dependent fees will be returned as well.
 * 6) pickup: object that includes uber store_id and instructions string;
 * 7) dropoff: object that includes address, contact info;
 * 8) courier_tip: not required but encouraged;
 * 9) external_user_id: ID of the consumer that the merchant associates with the order.
 *                      In our case, the StoreCustomer
 *
 * Example request:
 *
 * {
 *      "estimate_id": estimateId,
 *      "pickup_at": 0,
 *      "external_order_id": order.orderCode,
 *      "order_items": [
 *          {
 *              "name": "Wash and Fold",
 *              "quantity": 31.6,
 *          },
 *      ],
 *      "pickup": {
 *          "store_id": store.uberStoreUuid,
 *          "instructions": null,
 *          "external_store_id": store.id,
 *      },
 *      "dropoff": {
 *          "address": {
 *              "place": {
 *                  "id": address.googlePlacesId,
 *                  "provider": "google_places",
 *              },
 *              "apt_floor_suite": address.address2,
 *              "building_name": null,
 *          },
 *          "contact": {
 *              "first_name": storeCustomer.firstname,
 *              "last_name": storeCustomer.lastname,
 *              "email": storeCustomer.email,
 *              "phone": storeCustomer.phoneNumber,
 *          },
 *          "instructions": newPayload.deliveryInstructions,
 *          "type": "CURBSIDE",
 *      },
 *      "courier_tip": 500,
 *      "external_user_id": storeCustomer.id,
 *      "order_summary": {
 *          "currency_code": "USD",
 *          "order_value": order.netOrderTotal,
 *      },
 * }
 *
 * @param {Object} payload
 */
async function createUberDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const serviceOrder = await ServiceOrder.query(transaction)
            .withGraphJoined(
                `[
                orderItems.[referenceItems as refItem.[lineItemDetail]],
                order
            ]`,
            )
            .findById(newPayload.serviceOrderId);

        const { orderItems } = serviceOrder;
        const referenceItems = orderItems.map((item) => item.refItem);
        const lineItems = referenceItems.map((item) => item[0].lineItemDetail);
        const formattedLineItems = await formatOrderItems(lineItems);

        const store = await Store.query(transaction).findById(newPayload.storeId);
        const storeCustomer = await StoreCustomer.query(transaction).findById(
            newPayload.storeCustomerId,
        );
        const centsCustomer = await CentsCustomer.query(transaction).findById(
            newPayload.centsCustomerId,
        );
        const phoneNumber = phone(storeCustomer.phoneNumber, '', true);
        const formattedPhoneNumber = phoneNumber[0];

        const params = {
            estimate_id: newPayload.estimateId,
            pickup_at: newPayload.pickupAt,
            external_order_id: `${serviceOrder.orderCode}`,
            order_items: formattedLineItems,
            pickup: {
                store_id: store.uberStoreUuid,
                instructions: `Pickup order number ${serviceOrder.orderCode} for ${storeCustomer.firstName} ${storeCustomer.lastName}`,
                external_store_id: `${store.id}`,
            },
            dropoff: {
                address: {
                    place: {
                        id: newPayload.address.googlePlacesId,
                        provider: 'google_places',
                    },
                    apt_floor_suite: newPayload.address.address2
                        ? newPayload.address.address2
                        : null,
                    building_name: null,
                },
                contact: {
                    first_name: storeCustomer.firstName,
                    last_name: storeCustomer.lastName,
                    email: storeCustomer.email,
                    phone: formattedPhoneNumber,
                },
                instructions: `Order number: ${serviceOrder.orderCode}. Customer: ${storeCustomer.firstName} ${storeCustomer.lastName}. instructions: ${newPayload.address.instructions}`,
                type: 'CURBSIDE',
            },
            courier_tip: newPayload.deliveryTip ? Number(newPayload.deliveryTip * 100) : null,
            external_user_id: `${storeCustomer.id}`,
            order_summary: {
                currency_code: 'USD',
                // hardcoding this to keep delivery prices as low as possible
                order_value: 100,
            },
        };
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newPayload.uberToken}`,
        };
        const url = `${process.env.UBER_API_URL}/eats/deliveries/orders`;

        const response = await axios.post(url, params, {
            headers,
        });
        const data = await response.data;

        newPayload.serviceOrder = serviceOrder;
        newPayload.store = store;
        newPayload.customer = centsCustomer;
        newPayload.storeCustomer = storeCustomer;
        newPayload.order = serviceOrder.order;
        newPayload.thirdPartyDelivery = data;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createUberDelivery;
