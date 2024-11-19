const phone = require('phone');
const client = require('./twilio');

function formattedPhoneNumber(phoneNumber) {
    return phone(phoneNumber, '', true)[0];
}

async function send(phoneNumber, message) {
    try {
        const number = formattedPhoneNumber(phoneNumber);
        if (number) {
            const sms = await client.messages.create({
                body: message,
                from: process.env.TWILIO_phoneNumber,
                to: number,
            });
            return sms;
        }
        return false;
    } catch (error) {
        throw new Error(error);
    }
}

async function sendScheduledText(phoneNumber, message, dateScheduled) {
    try {
        const number = formattedPhoneNumber(phoneNumber);
        if (number) {
            const sms = await client.messages.create({
                body: message,
                from: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: number,
                scheduleType: 'fixed',
                sendAt: dateScheduled,
            });
            return sms;
        }
        return false;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = { send, sendScheduledText };
