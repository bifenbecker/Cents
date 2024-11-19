const CentsCustomer = require('../../models/centsCustomer');
const { hashPasswordGenerator } = require('../../utils/passwordGenerator');

async function createCentsCustomer(payload) {
    try {
        const newPayload = payload;
        const { firstName, lastName, phoneNumber, languageId, transaction } = payload;

        const centsCustomer = await CentsCustomer.query(transaction).findOne({ phoneNumber });

        if (centsCustomer) {
            newPayload.centsCustomer = centsCustomer;
        } else {
            const password = await hashPasswordGenerator();
            const newCentsCustomer = await CentsCustomer.query(transaction)
                .insert({
                    firstName,
                    lastName,
                    phoneNumber,
                    languageId,
                    password,
                })
                .returning('*');
            newPayload.centsCustomer = newCentsCustomer;
        }

        return newPayload;
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = exports = createCentsCustomer;
