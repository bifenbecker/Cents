const EmailService = require('../emailService');

async function businessMail(user, otherUser) {
    try {
        const body = `<p>Hello ${user.firstname} ${user.lastname},<br /><br /> ${otherUser.firstname} ${otherUser.lastname} has given you administrator access to your Cents management system. Please click on the link <a href=${process.env.CORS_ORIGIN}>here</a> to view your account details and access business and store settings for your laundromats. <br />
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

module.exports = businessMail;
