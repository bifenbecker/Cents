const jwt = require('jsonwebtoken');
const client = require('./index');
const smsText = require('../smsText');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const getDetails = require('./getDetails');
const getSettings = require('./getSettings');
const url = require('../urlShortener');

// Hello! Your order order ID number  is ready for pick up!
// Please come back to our store at location address  to pick up your laundry. Thanks!

async function readyForPickupNotification(store, order, storeCustomer) {
    try {
        const details = await getDetails(storeCustomer);
        const settings = await getSettings(store);
        // shortening the URL
        const token = await jwt.sign({ id: order.id }, process.env.JWT_SECRET_TOKEN_ORDER);
        const liveLink = process.env.LIVE_LINK;
        const longURL = `${liveLink}${token}`;
        const shortURL = await url(longURL);
        const sms = await client.messages.create({
            body: smsText(
                order,
                storeCustomer,
                details,
                store,
                'READY_FOR_PICKUP',
                shortURL,
                settings,
            ),
            from: process.env.TWILIO_phoneNumber,
            to: `${details.phone.includes('+1') ? details.phone : `+1${details.phone}`}`,
        });
        return { sms, languageId: details.languageId };
    } catch (error) {
        const errorMsg = `Error occurred while sending the text\n\n${error}`;
        LoggerHandler('error', errorMsg);

        return { error: true };
    }
}

module.exports = exports = readyForPickupNotification;
