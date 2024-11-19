const Pipeline = require('../pipeline');

// Uows
const checkActiveOrderDeliveriesForRemovedZipCodes = require('../../uow/locations/checkActiveOrderDeliveriesForZipCode');
const checkActiveSubscriptionsForRemovedZipCodes = require('../../uow/locations/checkActiveSubscriptionsForZipCode');

/**
 * Validates if active order deliveries and subscriptions are present for the zipCodes removed.
 *
 * The pipeline contains the following units of work:
 *
 * 1) checkActiveOrderDeliveriesForRemovedZipCodes
 * 2) checkActiveSubscriptionsForRemovedZipCodes
 *
 * @param {Object} payload
 */
const removeZipCodeValidationPipeline = async (payload) => {
    try {
        const removeZipCodes = new Pipeline([
            checkActiveOrderDeliveriesForRemovedZipCodes,
            checkActiveSubscriptionsForRemovedZipCodes,
        ]);
        const output = await removeZipCodes.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = removeZipCodeValidationPipeline;
