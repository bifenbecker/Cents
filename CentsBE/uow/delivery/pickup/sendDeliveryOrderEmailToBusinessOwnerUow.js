// Packages
const momenttz = require('moment-timezone');
const { get } = require('lodash');

// Models
const Business = require('../../../models/laundromatBusiness');
const User = require('../../../models/user');
const StoreSettings = require('../../../models/storeSettings');

// products
const EmailService = require('../../../services/emailService');
const getCustomerPreferences = require('../../customer/customerPreferences/getCustomerPreferencesUow');

const { deliveryProviders } = require('../../../constants/constants');

function formatWindowTimes(orderDelivery, timeZone) {
    const windowStart = get(orderDelivery, ['deliveryWindow', 0], 0);
    const windowEnd = get(orderDelivery, ['deliveryWindow', 1], 0);
    const startHour = windowStart && momenttz(windowStart).tz(timeZone).format('hh:mm a z');
    const endHour = windowEnd && momenttz(windowEnd).tz(timeZone).format('hh:mm a z');
    const date = windowStart && momenttz(windowStart).tz(timeZone).format('MMM Do');
    return {
        startHour,
        endHour,
        date,
    };
}

function getOwnDriverText({
    centsCustomer,
    orderDelivery,
    pickupStartHour,
    pickupEndHour,
    pickupDate,
    customerNotes,
    customerPreferences,
    storeCustomer,
    serviceOrder,
}) {
    let text = `
            <p style="font-weight: 600">Congrats!</p>
            <p style="font-weight: 600">
                New Laundry Order for ${centsCustomer.firstName} ${centsCustomer.lastName}
            </p>
            <p style="font-weight: 600">
                ${orderDelivery.address1}, ${orderDelivery.city}, ${
        orderDelivery.firstLevelSubdivisionCode
    }, ${orderDelivery.postalCode}
            </p>
            <p style="font-weight: 600">Pickup Time: ${pickupStartHour} - ${pickupEndHour} ${pickupDate}</p>
            <p>Customer preferences:</p>
            <p style="font-style: italic">Note: ${customerNotes || 'none'}</p>
    `;

    customerPreferences.forEach(({ label, values }) => {
        const selectionOptionString = values.join(', ');
        text += `<p>${label}: ${selectionOptionString}</p>`;
    });

    text += `<p>Hang Dry: ${
        storeCustomer.isHangDrySelected ? storeCustomer.hangDryInstructions : 'No'
    }</p>`;

    text += `
        <p>Special Instructions for this Order:</p>
        <p style="font-style: italic">${serviceOrder.notes || 'None'}</p>
        <p>Thanks,</p>
        <p>Cents Team</p>
    `;
    return text;
}

function getDoordashText({
    centsCustomer,
    orderDelivery,
    pickupStartHour,
    pickupEndHour,
    pickupDate,
    deliveryStartHour,
    deliveryEndHour,
    deliveryDate,
}) {
    const deliveryDateText = deliveryDate || 'Text When Ready';
    const deliveryTimeText =
        deliveryStartHour && deliveryEndHour
            ? `${deliveryStartHour} - ${deliveryEndHour}`
            : 'Text When Ready';
    return `
            <p>New Doordash Pickup Scheduled!</p>
            <p>
                Customer Name: ${centsCustomer.firstName} ${centsCustomer.lastName}
            </p>
            <p>
            Customer Address: ${orderDelivery.address1}, ${orderDelivery.city}, ${orderDelivery.firstLevelSubdivisionCode}, ${orderDelivery.postalCode}
            </p>
            <p>Scheduled Date: ${pickupDate}</p>
            <p>Scheduled Time Window: ${pickupStartHour} - ${pickupEndHour}</p>            
            <p>Delivery Date: ${deliveryDateText}</p>
            <p>Delivery Time Window: ${deliveryTimeText}</p>
    `;
}

/**
 * Format the email message
 *
 * @param {Object} centsCustomer
 * @param {Object} orderDelivery
 * @param {String} timeZone
 * @param {String} customerNotes
 * @param {Object} serviceOrder
 * @param {Array} customerPreferences
 * @param {Object} storeCustomer
 */
function formatEmail(
    centsCustomer,
    orderDelivery,
    timeZone,
    customerNotes,
    serviceOrder,
    customerPreferences,
    storeCustomer,
    isDoordashPickup,
) {
    const {
        startHour: pickupStartHour,
        endHour: pickupEndHour,
        date: pickupDate,
    } = formatWindowTimes(orderDelivery.pickup, timeZone);

    // just in case pickup date is invalid, don't send email
    if (pickupDate === 0) {
        return null;
    }

    if (isDoordashPickup) {
        const {
            startHour: deliveryStartHour,
            endHour: deliveryEndHour,
            date: deliveryDate,
        } = formatWindowTimes(orderDelivery.delivery, timeZone);

        return getDoordashText({
            centsCustomer,
            orderDelivery: orderDelivery.pickup,
            pickupStartHour,
            pickupEndHour,
            pickupDate,
            deliveryStartHour,
            deliveryEndHour,
            deliveryDate,
        });
    }

    return getOwnDriverText({
        centsCustomer,
        orderDelivery: orderDelivery.pickup,
        pickupStartHour,
        pickupEndHour,
        pickupDate,
        customerNotes,
        customerPreferences,
        storeCustomer,
        serviceOrder,
    });
}

/**
 * Send an email with delivery information to the business owner
 *
 * @param {Object} payload
 * @returns {Object} JSON object of the payload
 */
async function sendDeliveryOrderEmailToBusinessOwner(payload) {
    try {
        const newPayload = payload;
        const {
            transaction = null,
            businessId,
            customer: storeCustomer,
            serviceOrder,
            orderDelivery,
            customerNotes,
            centsCustomer,
        } = newPayload;
        const business = await Business.query(transaction).findById(businessId);
        const businessOwner = await User.query(transaction).findById(business.userId);
        const storeSettings = await StoreSettings.query(transaction)
            .where({
                storeId: serviceOrder.storeId,
            })
            .first();
        const { customerPreferences } = await getCustomerPreferences({
            businessId,
            centsCustomerId: centsCustomer.id,
        });

        const isDoordashPickup =
            orderDelivery.pickup.deliveryProvider === deliveryProviders.DOORDASH;

        const subject = isDoordashPickup
            ? `New Doordash Pickup for ${business.name}`
            : 'New Laundry Order with Cents!';
        const body = formatEmail(
            centsCustomer,
            orderDelivery,
            storeSettings.timeZone,
            customerNotes,
            serviceOrder,
            customerPreferences,
            storeCustomer,
            isDoordashPickup,
        );

        if (body) {
            const emailService = new EmailService(
                process.env.ADMIN_EMAIL,
                businessOwner.email,
                body,
                'Cents Admin',
                subject,
            );
            await emailService.email();
        }
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

const TEST_ONLY = {
    formatEmail,
};

module.exports = {
    TEST_ONLY,
    sendDeliveryOrderEmailToBusinessOwner,
};
