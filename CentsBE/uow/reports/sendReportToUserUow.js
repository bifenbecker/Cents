// products
const EmailService = require('../../services/emailService');

/**
 * Send the report to the recipient via email
 *
 * @param {Object} payload
 */
async function sendReportToUser(payload) {
    try {
        const newPayload = payload;
        const { reportCsvPath, reportCsvData, recipient, reportDefinition, options } = newPayload;

        const emailParams = {
            ...options,
            ...((reportDefinition && reportDefinition.getEmailParams()) || {}),
        };

        const body = `
        <p>Hi ${recipient.firstname},</p>
        <p>Please find the ${reportCsvPath} report attached to this email in CSV format. This report consists of data from ${emailParams.storeCount} locations. Thank you being a part of the Cents community.</p>
        <p>If you have any question, please reach out to our support team at help@trycents.com.</p>
        <p>Thanks,</p>
        <p>Cents Team</p>
        `;
        const emailService = new EmailService(
            process.env.ADMIN_EMAIL,
            recipient.email,
            body,
            'Cents Admin',
            'Access Your Downloaded Report from Cents',
            reportCsvPath,
            reportCsvData,
        );
        await emailService.email();
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = sendReportToUser;
