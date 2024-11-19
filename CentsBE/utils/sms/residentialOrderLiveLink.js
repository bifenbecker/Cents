/* eslint-disable max-len */
const jwt = require('jsonwebtoken');
const client = require('./index');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const url = require('../urlShortener');

function getSmsTextByStatus(storeCustomer, order, url, storeName) {
    if (order.status === 'HUB_PROCESSING_COMPLETE' && order.paymentStatus !== 'PAID') {
        return storeCustomer.languageId === 2
            ? `Novedades con respecto a su ropa de ${storeName}: Procesamos su ropa, pero no podemos entregarla antes de recibir el pago. Haga clic aquí ${url} para revisar y pagar su pedido.`
            : `Laundry Update from ${storeName}: Your laundry processing is complete but cannot be delivered back to you before payment. Please click here ${url} to review and pay for your order.`;
    }

    if (order.status === 'READY_FOR_PROCESSING') {
        return storeCustomer.languageId === 2
            ? `Novedades con respecto a su ropa de ${storeName}: Recibimos su orden. Para revisar su orden, agregar promociones y mas: ${url}`
            : `Laundry Update from ${storeName}: Order Received! Click to review your order, add promos and more: ${url}`;
    }
    return new Error('SMS not required for the order');
}

async function sendLiveLink(storeCustomer, order, storeName) {
    try {
        const token = await jwt.sign({ id: order.id }, process.env.JWT_SECRET_TOKEN_ORDER);
        const liveLink = process.env.LIVE_LINK;
        const longURL = `${liveLink}${token}`;
        const shortURL = await url(longURL);
        const sms = await client.messages.create({
            body: getSmsTextByStatus(storeCustomer, order, shortURL, storeName),
            from: process.env.TWILIO_phoneNumber,
            to: `${
                storeCustomer.phoneNumber.includes('+1')
                    ? storeCustomer.phoneNumber
                    : `+1${storeCustomer.phoneNumber}`
            }`,
        });
        return sms;
    } catch (error) {
        const errMsg = `Error occurred while sending the text: ${error}\n\nstoreCustomer: ${storeCustomer}\norder: ${order}\nstoreName: ${storeName}`;
        LoggerHandler('error', errMsg);
        return { error: true };
    }
}

module.exports = exports = sendLiveLink;
