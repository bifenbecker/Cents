const TermsOfServiceLog = require('../../models/termsOfServiceLog');

/**
 * Create the TermsOfServiceLog model using payload data
 *
 * @param {Object} payload
 */
async function logTermsOfServiceEntry(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const termsOfServiceLog = await TermsOfServiceLog.query(transaction)
            .insert({
                businessId: newPayload.business.id,
            })
            .returning('*');

        newPayload.termsOfServiceLog = termsOfServiceLog;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = logTermsOfServiceEntry;
