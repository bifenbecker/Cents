const CentsCustomer = require('../../models/centsCustomer');

/**
 * Edit the individual CentsCustomer
 *
 * @param {Object} payload
 */
async function editCentsCustomer(payload) {
    try {
        const newPayload = payload;
        const {
            centsCustomerId,
            transaction,
            phoneNumber,
            email,
            firstName,
            lastName,
            languageId,
        } = newPayload;

        const centsCustomer = await CentsCustomer.query(transaction)
            .patch({
                firstName,
                lastName,
                phoneNumber,
                email,
                languageId,
            })
            .findById(centsCustomerId)
            .returning('*');

        newPayload.centsCustomer = centsCustomer;
        return newPayload;
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = exports = editCentsCustomer;
