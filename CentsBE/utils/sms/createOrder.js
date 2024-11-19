const jwt = require('jsonwebtoken');
const client = require('./index');
const smsText = require('../smsText');
const getDetails = require('./getDetails');
const getSettings = require('./getSettings');
const url = require('../urlShortener');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function determineProperStatus(order) {
    if (order.paymentStatus === 'BALANCE_DUE' && order.paymentTiming === 'POST-PAY') {
        return 'CREATE_ORDER_POST_PAY';
    }

    return 'CREATE_ORDER';
}

// Thanks customer name! Your order number is order ID number,
// and we will send you an alert when it is ready for pick up!
// Should you have any questions, please give us a call at location phone number .
async function createOrderNotification(store, storeCustomer, order) {
    try {
        const details = await getDetails(storeCustomer, store);
        const settings = await getSettings(store);
        // shortening the URL
        const token = await jwt.sign({ id: order.id }, process.env.JWT_SECRET_TOKEN_ORDER);
        const liveLink = process.env.LIVE_LINK;
        const longURL = `${liveLink}${token}`;
        const shortURL = await url(longURL);
        const notificationType = await determineProperStatus(order);
        // check for language in secondary details and
        // give priority to language in secondary details.
        const sms = await client.messages.create({
            body: smsText(
                order,
                storeCustomer,
                details,
                store,
                notificationType,
                shortURL,
                settings,
            ),
            from: process.env.TWILIO_phoneNumber,
            to: `${details.phone.includes('+1') ? details.phone : `+1${details.phone}`}`,
        });
        return { sms, languageId: details.languageId };
    } catch (error) {
        const errMsg = `Error occurred while sending the text: ${error}\n\nstore: ${store}\nstoreCustomer: ${storeCustomer}\norder: ${order}`;
        LoggerHandler('error', errMsg);
        return { error: true };
    }
}

module.exports = exports = createOrderNotification;
