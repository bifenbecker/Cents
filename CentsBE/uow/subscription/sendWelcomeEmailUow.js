const EmailService = require('../../services/emailService');

async function sendWelcomeEmail(payload) {
    try {
        const { business } = payload;
        const businessOwner = await business.getBusinessOwner();
        const body = `
        <p>Hello ${businessOwner.firstname} ${businessOwner.lastname},</p>
        <p>Welcome to Cents! Please click on the link to verify your account and reset your password <a href=${process.env.CORS_ORIGIN}/password-reset?token=${businessOwner.resetPasswordToken}>here</a>.</p>
        <p>Thanks,</p>
        <p>Cents Team</p>
    `;
        const emailService = new EmailService(
            process.env.QUOTES_ADMIN_EMAIL,
            businessOwner.email,
            body,
            'Cents Admin',
            'Welcome to Cents!',
        );
        await emailService.email();
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendWelcomeEmail;
