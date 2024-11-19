const Pipeline = require('../pipeline');

// Uows
const toggleCommercialCustomerUOW = require('../../uow/customer/toggleCommercial');

/**
 * Toggles the isCommercial status and upates the commercialTierId
 *
 * @param {Object} payload
 * @returns {Object} output
 */
async function toggleCommercial(payload) {
    try {
        const toggleCommercialCustomerPipeline = new Pipeline([toggleCommercialCustomerUOW]);
        const output = await toggleCommercialCustomerPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = toggleCommercial;
