const EmailService = require('../emailService');

async function fogotPasswordMail(user) {
    try {
        const body = `<p>Hello,<br /><br />You have requested a password reset, please click <a href=${process.env.CORS_ORIGIN}/password-reset?token=${user.resetPasswordToken}>here</a> to reset your password. <br />
        Please ignore this email if you did not request a password change.<br /><br />
        Regards,<br />Cents Team</p>`;
        const emailService = new EmailService(
            process.env.ADMIN_EMAIL,
            user.email,
            body,
            'Cents Admin',
            'Reset password',
        );
        await emailService.email();
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = fogotPasswordMail;
