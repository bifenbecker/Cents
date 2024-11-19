const { sendScheduledText } = require('../../services/sms/twilioSmsService');

async function sendScheduledSMS({ message, phoneNumber, dateScheduled }) {
    const sms = await sendScheduledText(phoneNumber, message, dateScheduled);
    return sms;
}

module.exports = exports = sendScheduledSMS;
