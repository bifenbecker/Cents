const router = require('express').Router({ mergeParams: true });

const validateZipCodeInQuery = require('../../../validations/liveLink/store/validateZipCodeInQuery');
const validateOwnDelivery = require('../../../validations/liveLink/store/validateOwnDelivery');

const {
    getAvailableDeliverySettings,
    getGeneralDeliverySettings,
    getOnDemandDeliverySettings,
    getOwnDriverDeliverySettings,
    getStandardDeliveryWindows,
    validateServiceTypeAvailability,
} = require('./storeController');

// Only fetches the available delivery settings for this store and returns if they are active.
router.get('/available-delivery-settings', getAvailableDeliverySettings);
// Fetch on demand delivery settings with delivery windows.
router.get('/general-delivery-settings', getGeneralDeliverySettings);
// Fetch on demand delivery settings with delivery windows.
router.get('/on-demand-delivery-settings', getOnDemandDeliverySettings);
// Fetch own driver delivery settings with delivery windows.
router.get('/own-driver-delivery-settings', validateZipCodeInQuery, getOwnDriverDeliverySettings);

router.get('/own-delivery-windows', validateOwnDelivery, getStandardDeliveryWindows);
router.get('/service-availability/get', validateServiceTypeAvailability);

module.exports = exports = router;
