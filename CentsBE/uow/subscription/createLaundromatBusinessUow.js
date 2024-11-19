const Business = require('../../models/laundromatBusiness');
const BusinessSettings = require('../../models/businessSettings');
const BusinessOrderCount = require('../../models/businessOrderCount');

/**
 * Create the LaundromatBusiness model and settings using incoming data
 *
 * @param {Object} payload
 */
async function createLaundromatBusiness(payload) {
    try {
        const newPayload = payload;
        const addressObject = newPayload.address;
        const { transaction } = newPayload;

        const business = await Business.query(transaction)
            .insert({
                name: newPayload.businessName,
                address: addressObject ? addressObject.address : null,
                city: addressObject ? addressObject.city : null,
                state: addressObject ? addressObject.state : null,
                zipCode: addressObject ? addressObject.zipCode : null,
                userId: newPayload.businessOwner.id,
            })
            .returning('*');

        const businessSettings = await BusinessSettings.query(transaction).insert({
            businessId: business.id,
        });
        const businessOrderCount = await BusinessOrderCount.query(transaction).insert({
            businessId: business.id,
            totalOrders: 0,
        });

        newPayload.business = business;
        newPayload.businessSettings = businessSettings;
        newPayload.businessOrderCount = businessOrderCount;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createLaundromatBusiness;
