const momenttz = require('moment-timezone');
const { isEmpty } = require('lodash');
const EmailService = require('../../../services/emailService');
const ServiceOrder = require('../../../models/serviceOrders');
const {
    statuses,
    deliveryProviders,
    orderDeliveryStatuses,
} = require('../../../constants/constants');

function formatWindowTimes(deliveryWindow, timeZone) {
    const windowStart = Number(deliveryWindow[0]) || 0 * 1;
    const windowEnd = Number(deliveryWindow[1]) || 0 * 1;

    const startHour = windowStart && momenttz(windowStart).tz(timeZone).format('hh:mm a z');
    const endHour = windowEnd && momenttz(windowEnd).tz(timeZone).format('hh:mm a z');
    const date = windowStart && momenttz(windowStart).tz(timeZone).format('MMM Do');
    return {
        startHour,
        endHour,
        date,
    };
}

async function sendOrderDelayedEmail(payload) {
    try {
        const { serviceOrderId } = payload;
        const serviceOrder = await ServiceOrder.query()
            .withGraphFetched(
                `[
                store.[settings, laundromatBusiness.user]
                order.[pickup]
            ]`,
            )
            .findById(serviceOrderId);
        const { store } = serviceOrder;
        const businessOwner = store.laundromatBusiness.user;
        const { pickup } = serviceOrder.order;

        if (
            [statuses.SUBMITTED].includes(serviceOrder.status) &&
            !isEmpty(pickup) &&
            pickup.deliveryProvider === deliveryProviders.DOORDASH &&
            pickup.status !== orderDeliveryStatuses.EN_ROUTE_TO_PICKUP
        ) {
            // check to see if doordash pickup and driver is not already assigned
            const deliveryWindow = formatWindowTimes(
                pickup.deliveryWindow,
                store.settings.timeZone,
            );

            const body = `
                <p>Hello ${businessOwner.firstname} ${businessOwner.lastname},</p>
                <p>DoorDash is still looking for a Dasher to pickup order ${serviceOrder.orderCode} from ${pickup.customerName} at ${pickup.address1} ${pickup.city}, ${pickup.firstLevelSubdivisionCode} ${pickup.postalCode}. This order was scheduled to be picked up between ${deliveryWindow.startHour} and ${deliveryWindow.endHour} on ${deliveryWindow.date}.
                <p>Thanks,</p>
                <p>Cents Team</p>
            `;
            const emailService = new EmailService(
                process.env.ADMIN_EMAIL,
                businessOwner.email,
                body,
                'Cents Admin',
                `DoorDash Pickup Delayed for ${store.name}`,
            );
            await emailService.email();
        }

        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendOrderDelayedEmail;
