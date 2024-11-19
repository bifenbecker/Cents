const router = require('express').Router();

const updateStorePassword = require('./updateStorePassword');
const addHub = require('./addHub');
const devices = require('./devices');
const add = require('./addLocation');
const insights = require('./insights');
const services = require('./services');
const products = require('./products');
const settings = require('./settings');
const getShifts = require('./getShifts');
const createShifts = require('./addShifts');
// const locations = require('./locations.js');
const fullService = require('./fullService');
const updateShiftTimings = require('./updateShiftTimings');
const updateShiftsAndTimings = require('./updateShiftsAndTimings');
const singleLocation = require('./listLocation');
const { getDistricts } = require('./getDistricts');
const updateLocation = require('./updateLocation');
const storesWithoutHub = require('./storesWithoutHub');
const bagTracking = require('./bagTracking');
// const getRegionDistrictLocations = require('./getRegionDistrictLocations');
const updateTaxInfo = require('./updateTaxInfo');
const cashCardRoutes = require('./cashCard');
const removeZones = require('./removeZone');
const removeShiftWindow = require('./removeShiftWindow');
const validateZipCode = require('./validateZipcode');
const updateDeliverySettings = require('./updateDeliverySettings');
const createOwnDeliverySettings = require('./createOwnDeliverySettings');
const updateOnDemandSettings = require('./updateDemandSettings');
const createOnDemadDeliverySettings = require('./createOnDemandDeliverysettings');
const updateTaxInfoValidation = require('../../../../validations/locations/updateTaxInfo');
const addHubValidations = require('../../../../validations/locations/hub');
const createShiftValidations = require('../../../../validations/createShift');
const getLocationValidations = require('../../../../validations/locations/getDetails');
const fullServiceValidations = require('../../../../validations/locations/fullServices');
const updateShiftTimingValidations = require('../../../../validations/shiftValidations/updateshiftTimings');
const updateShiftAndTimingValidations = require('../../../../validations/shiftValidations/updateShiftAndTimings');
const createLocationValidations = require('../../../../validations/locations/createLocation');
const updateLocationValidations = require('../../../../validations/locations/updateLocation');
const updateStorePasswordValidation = require('../../../../validations/locations/updateStorePassword');
const updateOwnDriverDeliverySettingValidations = require('../../../../validations/locations/updateOwndriverDeliverySettings');
const updateOwndriverDeliverySettings = require('./updateDriverDeliverySettings');
const deliverySettingsValidation = require('../../../../validations/locations/generalDeliverySettings');
const locationServiceValidation = require('../../../../validations/locations/services/locationServiceValidation');
const zipcodeValidation = require('../../../../validations/locations/zipcode');
const deliverySettings = require('./getDeliverySettings');
const { getShiftsValidations } = require('../../../../validations/shiftValidations/getShifts');
const createOwnDeliverySettingsValidation = require('../../../../validations/locations/createOwnDeliverySettings');
const updateOnDemandSettingsValidation = require('../../../../validations/locations/updateDemandDeliverySettings');
const createOnDemadDeliverySettingsValidation = require('../../../../validations/locations/createOnDemandDeliverySettings');

const removeZipCodeValidation = require('./removeZipCodeValidation');
const removeZipCodeValidator = require('../../../../validations/locations/removeZipCodeValidation');
const toggleDeliverySettingsValidation = require('../../../../validations/locations/toggleDeliverySettingsValidation');
const toggleOnDemandDeliverySettingsValidation = require('../../../../validations/locations/toggleOnDemandSettingsValidation');
const toggleOwnDeliverySettingsValidation = require('../../../../validations/locations/toggleOwnDeliverySettingsValidation');

const validateTimingsChange = require('./validateTimingsChange');
const validateTimingsValidation = require('../../../../validations/shiftValidations/validateTimingsValidation');
const removeZonesValidator = require('../../../../validations/locations/removeZonesValidator');
const updateReportingAccessible = require('./updateReportingAccessible');
const updateReportingAccessibleValidation = require('../../../../validations/locations/updateReportingAccessible');

router.put(
    '/:id/updateStorePassword',
    getLocationValidations,
    updateStorePasswordValidation,
    updateStorePassword,
);
// router.get('/', locations);
router.put('/settings/bagTracking', bagTracking);
router.get('/devices', devices);
router.get('/shifts', getShiftsValidations, getShifts);
router.use('/settings', settings);
router.get('/districts', getDistricts);
router.put('/hub', addHubValidations, addHub);
router.post('/', createLocationValidations, add);
router.get('/storesWithoutHub', storesWithoutHub);
// router.get('/regions', getRegionDistrictLocations);
router.get('/:id', getLocationValidations, singleLocation);
router.put('/', updateLocationValidations, updateLocation);
router.put('/shifts', updateShiftTimingValidations, updateShiftTimings);
router.put('/:storeId/shifts', updateShiftAndTimingValidations, updateShiftsAndTimings);
router.post('/:storeId/validate-timings-change', validateTimingsValidation, validateTimingsChange);
router.post('/shifts', createShiftValidations, createShifts);
router.get('/:id/insights', getLocationValidations, insights);
router.get('/:storeId/delivery-settings', deliverySettings);
router.use('/:id/services', getLocationValidations, services);
router.use('/:id/products', getLocationValidations, products);
router.patch('/full-service/:id', fullServiceValidations, fullService);
router.patch('/:id/tax-info', getLocationValidations, updateTaxInfoValidation, updateTaxInfo);
router.use('/:id/cashCard', cashCardRoutes);
router.put('/validate-zipcode', zipcodeValidation, validateZipCode);
router.patch(
    '/:storeId/delivery-settings',
    deliverySettingsValidation,
    locationServiceValidation,
    toggleDeliverySettingsValidation,
    updateDeliverySettings,
);
router.patch(
    '/:storeId/own-delivery-settings',
    updateOwnDriverDeliverySettingValidations,
    toggleOwnDeliverySettingsValidation,
    updateOwndriverDeliverySettings,
);
router.post(
    '/:storeId/own-delivery-settings',
    createOwnDeliverySettingsValidation,
    createOwnDeliverySettings,
);
router.put(
    '/:storeId/cents-delivery-settings',
    updateOnDemandSettingsValidation,
    toggleOnDemandDeliverySettingsValidation,
    updateOnDemandSettings,
);
router.post(
    '/:storeId/cents-delivery-settings',
    createOnDemadDeliverySettingsValidation,
    createOnDemadDeliverySettings,
);
router.delete('/:storeId/zones/:zoneId', removeZonesValidator, removeZones);
router.post('/:storeId/validate-remove-zipcodes', removeZipCodeValidator, removeZipCodeValidation);
router.patch(
    '/:id/reporting-accessible',
    getLocationValidations,
    updateReportingAccessibleValidation,
    updateReportingAccessible,
);
router.delete('/:storeId/shifts/:shiftId', removeShiftWindow);

module.exports = router;
