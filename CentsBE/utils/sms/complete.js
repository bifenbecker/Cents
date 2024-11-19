const jwt = require('jsonwebtoken');
const client = require('./index');
const smsText = require('../smsText');
const getDetails = require('./getDetails');
const getSettings = require('./getSettings');
const url = require('../urlShortener');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function completeOrderNotification(store, order, storeCustomer) {
    try {
        const details = await getDetails(storeCustomer, store);
        const settings = await getSettings(store);
        // shortening the URL
        const token = await jwt.sign({ id: order.id }, process.env.JWT_SECRET_TOKEN_ORDER);
        const liveLink = process.env.LIVE_LINK;
        const longURL = `${liveLink}${token}`;
        const shortURL = await url(longURL);
        const sms = await client.messages.create({
            body: smsText(order, storeCustomer, details, store, 'COMPLETED', shortURL, settings),
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

module.exports = exports = completeOrderNotification;
