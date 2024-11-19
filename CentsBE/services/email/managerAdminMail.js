const EmailService = require('../emailService');

async function managerMail(user, otherUser) {
    try {
        const body = `<p>Hello ${user.firstname} ${user.lastname},<br /><br /> ${otherUser.firstname} ${otherUser.lastname} has given you manager access to your Cents management system. Please click on the link to verify your account and reset your password, <a href=${process.env.CORS_ORIGIN}/password-reset?token=${user.resetPasswordToken}>here</a> . <br />
        <br />Regards,<br />Cents Team</p>`;
        const emailService = new EmailService(
            process.env.ADMIN_EMAIL,
            user.email,
            body,
            'Cents Admin',
            'Action Required',
        );
        await emailService.email();
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = managerMail;
