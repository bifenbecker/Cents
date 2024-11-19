const EmailService = require('../emailService');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function emailOTP(phoneNumber, otp) {
    try {
        const body = `<p>Hello!
        <br/> Your cents otp for your phone number ${phoneNumber} is ${otp}.</p>
        Regards,<br />Cents Team</p>`;
        const emailService = new EmailService(
            process.env.ADMIN_EMAIL,
            process.env.QA_EMAIL,
            body,
            'Cents Admin',
            'OTP',
        );
        await emailService.email();
    } catch (error) {
        LoggerHandler('error', `Error occurred while sending otp mail:\n\n${error}`);
    }
}

module.exports = exports = emailOTP;
