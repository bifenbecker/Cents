const twilioClient = require('../../utils/sms/index');

function canSendSms() {
    return process.env.ENABLE_SMS === 'TRUE' || process.env.NODE_ENV !== 'development';
}

function hasValidSMS(smsVar) {
    if (smsVar) {
        return true;
    }
    return false;
}

function message(otp, messageType) {
    let sms = '';
    switch (messageType) {
        case 'kin':
            sms = `${otp} is your one-time verification (OTP) code to login to laundry service powered by Cents. Please enter it when prompted on the tablet app screen.`;
            break;
        case 'liveLink':
            sms = `${otp} is your One Time Verification (OTP) code to confirm your phone number at Cents.`;
            break;
        default:
            break;
    }
    return sms;
}

async function sendOTP(phone, otp, messageType, isAuthorized) {
    try {
        if (!canSendSms()) {
            return true;
        }
        if (!isAuthorized) {
            const smsVar = await twilioClient.messages.create({
                body: message(otp, messageType),
                from: process.env.TWILIO_phoneNumber,
                to: `${phone.includes('+1') ? phone : `+1${phone}`}`,
            });
            hasValidSMS(smsVar);
        }
        return null;
    } catch (error) {
        if (!process.env.QA_EMAIL) {
            throw new Error(error);
        }
        return null;
    }
}
module.exports = sendOTP;
