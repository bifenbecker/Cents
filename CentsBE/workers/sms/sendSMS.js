const { send } = require('../../services/sms/twilioSmsService');

async function sendSMS({ message, phoneNumber }) {
    const sms = await send(phoneNumber, message);
    return sms;
}

module.exports = exports = sendSMS;
