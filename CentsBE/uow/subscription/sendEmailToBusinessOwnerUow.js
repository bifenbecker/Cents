// packages
const jwt = require('jsonwebtoken');

// utils
const shortenUrl = require('../../utils/urlShortener');

// products
const EmailService = require('../../services/emailService');

async function sendEmailToBusinessOwner(payload) {
    try {
        const { business } = payload;
        const { businessOwner } = payload;

        const token = await jwt.sign({ id: business.id }, process.env.QUOTES_JWT);

        const quotesLiveLink = process.env.QUOTES_LIVE_LINK;
        const longURL = `${quotesLiveLink}${token}`;
        const shortUrl = await shortenUrl(longURL);
        const body = `
        <p>Hello ${businessOwner.firstname} ${businessOwner.lastname},</p>
        <p>Please access your secure quote by clicking the following link: ${shortUrl}.
        <p>Thanks,</p>
        <p>Cents Team</p>
        `;
        const emailService = new EmailService(
            process.env.QUOTES_ADMIN_EMAIL,
            businessOwner.email,
            body,
            'Cents Admin',
            'Access Your Secure Cents Quote',
        );
        await emailService.email();
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendEmailToBusinessOwner;
