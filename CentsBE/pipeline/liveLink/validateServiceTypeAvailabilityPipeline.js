const Pipeline = require('../pipeline');

// Uows
const fetchStoreSettings = require('../../uow/store/fetchStoreSettingsUow');
const determineDeliveryTierDetails = require('../../uow/store/determineDeliveryTierDetailsUow');
const getAvailableLaundryServicesForStore = require('../../uow/liveLink/services/getAvailableLaundryServicesForStoreUow');
const getAvailableDryCleaningServicesForStore = require('../../uow/liveLink/services/getAvailableDryCleaningServicesForStoreUow');
const validateDeliveryServicesForStore = require('../../uow/liveLink/services/validateDeliveryServicesForStoreUow');

/**
 * For a given store, run a series of UoWs that will determine whether the
 * store offers laundry and/or dry cleaning services based on various settings
 * and tiered pricing structures
 *
 * @param {Object} payload
 */
async function validateServiceTypeAvailabilityPipeline(payload) {
    try {
        const validationPipeline = new Pipeline([
            fetchStoreSettings,
            determineDeliveryTierDetails,
            getAvailableLaundryServicesForStore,
            getAvailableDryCleaningServicesForStore,
            validateDeliveryServicesForStore,
        ]);
        const output = await validationPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = validateServiceTypeAvailabilityPipeline;
