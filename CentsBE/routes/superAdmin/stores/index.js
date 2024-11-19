const router = require('express').Router();

// Controller methods
const {
    getAllStores,
    getIndividualStore,
    updateIndividualValueForStore,
    getServiceOrderVolumePerMonth,
    getCurrentMonthServiceOrderCount,
    updateIndividualValueForStoreSettings,
    updateValueForPrinterSettings,
    searchStores,
    updateStorePassword,
    getStoreServiceOrders,
    getStoreInventoryOrders,
    toggleDoorDashSettings,
} = require('./storesController');

// Validations
const updateIndividualStoreValueValidation = require('../../../validations/superAdmin/stores/updateIndividualValueForStore');
const updateIndividualStoreSettingsValidation = require('../../../validations/superAdmin/stores/updateIndividualValueForStoreSettings');
const newPasswordValidation = require('../../../validations/superAdmin/utils/createNewPassword');

router.get('/all', getAllStores);
router.get('/all/search', searchStores);
router.get('/:id', getIndividualStore);
router.put('/:id/update', updateIndividualStoreValueValidation, updateIndividualValueForStore);
router.get('/:id/service-orders', getStoreServiceOrders);
router.get('/:id/inventory-orders', getStoreInventoryOrders);
router.get('/:id/service-orders/volume/month', getServiceOrderVolumePerMonth);
router.get('/:id/service-orders/volume/month/current', getCurrentMonthServiceOrderCount);
router.put(
    '/:id/settings/update',
    updateIndividualStoreSettingsValidation,
    updateIndividualValueForStoreSettings,
);
router.put('/:id/printer/settings/update', updateValueForPrinterSettings);
router.put('/:id/password/save', newPasswordValidation, updateStorePassword);
router.put('/:id/cents-delivery/doordash/update', toggleDoorDashSettings);

module.exports = exports = router;
