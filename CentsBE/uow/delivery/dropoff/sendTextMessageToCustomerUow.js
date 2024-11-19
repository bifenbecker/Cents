const momenttz = require('moment-timezone');
const jwt = require('jsonwebtoken');

const Store = require('../../../models/store');
const StoreCustomer = require('../../../models/storeCustomer');
const StoreSettings = require('../../../models/storeSettings');
const twilioClient = require('../../../utils/sms/index');
const url = require('../../../utils/urlShortener');

/**
 * Generate the proper live link URL
 *
 * @param {Number} serviceOrderId
 */
async function generateLiveLink(serviceOrderId) {
    const token = await jwt.sign({ id: serviceOrderId }, process.env.JWT_SECRET_TOKEN_ORDER);
    const liveLink = process.env.LIVE_LINK;
    const liveLinkUrl = await url(`${liveLink}${token}`);

    return liveLinkUrl;
}

/**
 * If the delivery provider is Uber, return an Uber-specific message
 *
 * @param {Object} serviceOrder
 * @param {Object} orderDelivery
 * @param {String} etd
 * @param {String} liveLink
 */
async function getUberDeliveryMessage(serviceOrder, orderDelivery, etd, liveLink) {
    let sms = '';

    switch (orderDelivery.status) {
        case 'EN_ROUTE_TO_DROP_OFF':
            sms = `Your laundry order #${serviceOrder.orderCode} has been picked up and is being delivered to you. Estimated arrival time is ${etd}. Click here to review and track your order: ${liveLink}`;
            break;
        case 'COMPLETED':
            sms = `Your laundry order #${serviceOrder.orderCode} has been delivered. Thank you for doing your laundry with us! Click here to view your order: ${liveLink}`;
            break;
        case 'FAILED':
        case 'CANCELED':
            sms = `Laundry Update: Your delivery has been cancelled. To reschedule, click here: ${liveLink}`;
            break;
        default:
            break;
    }

    return sms;
}

/**
 * If the delivery provider is DoorDash, return a DoorDash-specific message
 *
 * @param {Object} serviceOrder
 * @param {Object} orderDelivery
 * @param {String} etd
 * @param {String} liveLink
 * @param {Object} thirdPartyDelivery
 * @param {Object} store
 */
async function getDoorDashDeliveryMessage(
    serviceOrder,
    orderDelivery,
    etd,
    liveLink,
    thirdPartyDelivery,
    store,
) {
    const { status, type } = orderDelivery;

    let sms = '';

    if (status === 'EN_ROUTE_TO_PICKUP' && type === 'PICKUP') {
        sms = `Laundry Update from ${store.name}: A Dasher is on the way to pick up your laundry. Estimated arrival time is ${etd}. Your Dasher's name is ${thirdPartyDelivery.dasher.first_name} and their phone number is ${thirdPartyDelivery.dasher.phone_number}. View your order here: ${liveLink}. If you would like to unsubscribe from these messages, please reply with "STOP." Thanks, your team at ${store.name}`;
    }

    if (status === 'EN_ROUTE_TO_DROP_OFF' && type === 'RETURN') {
        sms = `Laundry Update from ${store.name}: Your laundry order #${serviceOrder.orderCode} has been picked up and is being delivered to you. Estimated arrival time is ${etd}. Your Dasher's name is ${thirdPartyDelivery.dasher.first_name} and their phone number is ${thirdPartyDelivery.dasher.phone_number}. Click here to review and track your order: ${liveLink}. If you would like to unsubscribe from these messages, please reply with "STOP." Thanks, your team at ${store.name}`;
    }

    if (status === 'COMPLETED' && type === 'RETURN') {
        sms = `Laundry Update ${store.name}: Your laundry order #${serviceOrder.orderCode} has been delivered. Thank you for doing your laundry with us! Click here to view your order: ${liveLink}. If you would like to unsubscribe from these messages, please reply with "STOP." Thanks, your team at ${store.name}`;
    }

    if (status === 'CANCELED' || status === 'FAILED') {
        sms = `Laundry Update ${store.name}: Your delivery has been canceled. To reschedule, click here: ${liveLink}. If you would like to unsubscribe from these messages, please reply with "STOP." Thanks, your team at ${store.name}`;
    }

    return sms;
}

/**
 * Based on status, return a text message to the customer.
 *
 * @param {Object} serviceOrder
 * @param {Object} orderDelivery
 * @param {String} etd
 * @param {Object} thirdPartyDelivery
 * @param {Object} store
 */
async function getThirdPartyMessage(serviceOrder, orderDelivery, etd, thirdPartyDelivery, store) {
    const liveLinkUrl = await generateLiveLink(serviceOrder.id);

    if (orderDelivery.deliveryProvider === 'UBER') {
        return getUberDeliveryMessage(serviceOrder, orderDelivery, etd, liveLinkUrl);
    }
    return getDoorDashDeliveryMessage(
        serviceOrder,
        orderDelivery,
        etd,
        liveLinkUrl,
        thirdPartyDelivery,
        store,
    );
}

/**
 * Generate the specific texts for pickup via own driver network
 *
 * @param {Object} orderDelivery
 * @param {String} liveLink
 * @param {String} timeZone
 * @param {Object} store
 * @returns {String} sms
 */
function generatePickupTextMessage(orderDelivery, liveLink, timeZone, store) {
    let sms = '';

    const windowOneUnix = orderDelivery.deliveryWindow[0] * 1;
    const windowTwoUnix = orderDelivery.deliveryWindow[1] * 1;
    const hourOne = momenttz(windowOneUnix)
        .tz(timeZone || 'America/Los_Angeles')
        .format('hh:mm a z');
    const hourTwo = momenttz(windowTwoUnix)
        .tz(timeZone || 'America/Los_Angeles')
        .format('hh:mm a z');

    switch (orderDelivery.status) {
        case 'COMPLETED':
            sms = `Laundry Update from ${store.name}: Our driver is on the way to pick up your laundry and should get there between ${hourOne} - ${hourTwo}. View your order here: ${liveLink}. If you would like to unsubscribe from these messages, please reply with "STOP." Thanks, your team at ${store.name}`;
            break;
        default:
            break;
    }

    return sms;
}

/**
 * Generate the specific texts for return delivery via own driver network
 *
 * @param {Object} serviceOrder
 * @param {String} customerName
 * @param {String} liveLink
 * @param {Object} store
 * @returns {String} sms
 */
function generateReturnDeliveryTextMessage(serviceOrder, customerName, liveLink, store) {
    let sms = '';

    switch (serviceOrder.status) {
        case 'COMPLETED':
            sms = `Hi ${customerName}! Our driver is on the way with your laundry delivery. Click here to view your order: ${liveLink}. If you would like to unsubscribe from these messages, please reply with "STOP." Thanks, your team at ${store.name}`;
            break;
        default:
            break;
    }

    return sms;
}

/**
 * Based on status, return the proper text message to send for OWN_DRIVER deliveries
 *
 * @param {Object} serviceOrder
 * @param {Object} orderDelivery
 * @param {String} customerName
 * @param {String} timeZone
 * @param {Object} store
 */
async function getOwnDriverMessage(serviceOrder, orderDelivery, customerName, timeZone, store) {
    let sms = '';

    const liveLinkUrl = await generateLiveLink(serviceOrder.id);

    if (orderDelivery.type === 'RETURN') {
        sms = generateReturnDeliveryTextMessage(serviceOrder, customerName, liveLinkUrl, store);
    } else {
        sms = generatePickupTextMessage(orderDelivery, liveLinkUrl, timeZone, store);
    }

    return sms;
}

/**
 * Use Twilio API to validate whether US phone number is real.
 *
 * @param {String} customerPhoneNumber
 */
async function validatePhoneNumber(customerPhoneNumber) {
    try {
        const validation = await twilioClient.lookups
            .phoneNumbers(customerPhoneNumber)
            .fetch({ countryCode: 'US' });
        return validation;
    } catch (error) {
        return null;
    }
}

/**
 * Get the estimated time of delivery for Uber
 *
 * @param {Object} thirdPartyDelivery
 * @param {String} timeZone
 */
async function getEstimateUberDelivery(thirdPartyDelivery, timeZone) {
    const courierTripsExist = thirdPartyDelivery.courier_trips.length > 0;

    if (courierTripsExist) {
        const etdUnix = thirdPartyDelivery.courier_trips[0].status.etd * 1;
        const formattedEtd = momenttz(etdUnix)
            .tz(timeZone || 'America/Los_Angeles')
            .format('hh:mm a z');

        return formattedEtd;
    }

    return null;
}

/**
 * Get the estimated time of delivery for DoorDash
 *
 * @param {String} deliveryType
 * @param {Object} thirdPartyDelivery
 * @param {String} timeZone
 */
async function getEstimatedDoorDashDelivery(deliveryType, thirdPartyDelivery, timeZone) {
    const estimatedTime =
        deliveryType === 'PICKUP'
            ? thirdPartyDelivery.estimated_pickup_time
            : thirdPartyDelivery.quoted_delivery_time;
    const formattedDeliveryTime = momenttz(estimatedTime)
        .tz(timeZone || 'America/Los_Angeles')
        .format('hh:mm a z');
    return formattedDeliveryTime;
}

/**
 * Get the estimated time of delivery using the ThirdPartyDelivery object
 *
 * @param {Object} orderDelivery
 * @param {Object} thirdPartyDelivery
 * @param {String} timeZone
 */
async function getEstimatedTimeOfDelivery(orderDelivery, thirdPartyDelivery, timeZone) {
    if (orderDelivery.deliveryProvider === 'UBER') {
        return getEstimateUberDelivery(thirdPartyDelivery, timeZone);
    }
    return getEstimatedDoorDashDelivery(orderDelivery.type, thirdPartyDelivery, timeZone);
}

/**
 * Send a delivery-related text message to the customer
 *
 * @param {Object} payload
 */
async function sendTextMessageToCustomer(payload) {
    try {
        let message;

        const newPayload = payload;
        const { transaction, serviceOrder, orderDelivery, thirdPartyDelivery } = newPayload;
        const isOnDemand = orderDelivery.deliveryProvider !== 'OWN_DRIVER';

        const customer = await StoreCustomer.query(transaction)
            .withGraphFetched('[centsCustomer, store]')
            .findById(serviceOrder.storeCustomerId);
        const storeSettings = await StoreSettings.query(transaction)
            .where({ storeId: serviceOrder.storeId })
            .first();
        const store = await Store.query(transaction).findById(serviceOrder.storeId);
        const phone = customer.centsCustomer.phoneNumber;
        const phoneNumberValidated = await validatePhoneNumber(phone);

        if (isOnDemand) {
            const estimatedTimeOfDelivery = await getEstimatedTimeOfDelivery(
                orderDelivery,
                newPayload.thirdPartyDelivery,
                storeSettings.timeZone,
            );
            message = await getThirdPartyMessage(
                serviceOrder,
                orderDelivery,
                estimatedTimeOfDelivery,
                thirdPartyDelivery,
                store,
            );
        } else {
            message = await getOwnDriverMessage(
                serviceOrder,
                orderDelivery,
                customer.centsCustomer.firstName,
                storeSettings.timeZone,
                store,
            );
        }

        if (message && phoneNumberValidated && storeSettings.hasSmsEnabled) {
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_phoneNumber,
                to: `${phone.includes('+1') ? phone : `+1${phone}`}`,
            });
        }

        newPayload.storeCustomer = customer;
        newPayload.customer = customer.centsCustomer;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = sendTextMessageToCustomer;
