const Business = require('../../../models/laundromatBusiness');

/**
 * Use incoming payload to create a new LaundromatBusiness model
 *
 * @param {Object} payload
 */
async function createBusiness(payload) {
    try {
        const newPayload = payload;
        const { transaction, business } = newPayload;

        const createdBusiness = await Business.query(transaction).insert({
            name: business.name,
            address: business.address,
            city: business.city,
            state: business.state,
            zipCode: business.zipCode,
            userId: newPayload.createdUser.id,
        });

        newPayload.createdBusiness = createdBusiness;
        newPayload.businessId = createdBusiness.id;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createBusiness;
