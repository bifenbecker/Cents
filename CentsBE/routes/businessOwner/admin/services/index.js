const router = require('express').Router();
const serviceCategory = require('./serviceCategory');
const serviceMaster = require('./serviceMaster');
// const createServicePrice = require('../../../validations/services/createServicePrices');
const updateService = require('./updateService');
const modifiers = require('./modifiers');
const archiveServices = require('./archiveService');
const insights = require('./insights');

const {
    getServicesByCategory,
    getServiceCategoriesForService,
    createNewServiceCategory,
    updateServiceCategoryTurnAroundTime,
    getAllServicePricingStructures,
    getServiceCategoriesForType,
} = require('./servicesController');

// validations
const updateServiceValidations = require('../../../../validations/services/updateServices');
const createServiceValidation = require('../../../../validations/services/createServices');
const updateServicePriceValidation = require('../../../../validations/services/updateServicePrices');
const bulkUpdateValidation = require('../../../../validations/services/bulkUpdateValidation');
const insightsValidator = require('../../../../validations/services/insights');

const modifiersGetter = require('../../../../utils/getBusinessModifiers');
const toggleModifier = require('./patchModifier');
const toggleModifierValidator = require('../../../../validations/services/modifiers/toggle');

const archiveServicesValidator = require('../../../../validations/services/archiveService');

router.get('/pricing-structures', getAllServicePricingStructures);
router.get('/:id/categories', getServiceCategoriesForService);
router.get('/type/:id/categories', getServiceCategoriesForType);
router.get('/categories', getServicesByCategory);
router.post('/category', createNewServiceCategory);
router.put('/categories/turn-around-time', updateServiceCategoryTurnAroundTime);
router.get('/cat/list', serviceCategory.getCategories);
router.post('/cat/save', serviceCategory.saveCategory);
router.delete('/cat/remove', serviceCategory.removeCategory);
router.use('/modifiers', modifiers);
router.get('/list', serviceMaster.getServices);
// New services list for cents 2.0 promotions
router.get('/newlist', serviceMaster.getDryCleaningAndServices);
router.post('/save', createServiceValidation, modifiersGetter, serviceMaster.saveService);
router.put('/update-price', updateServicePriceValidation, serviceMaster.updateServicePrices);
router.put('/:serviceId/prices', bulkUpdateValidation, serviceMaster.bulkUpdate);
router.put('/:id', updateServiceValidations, updateService);
router.get('/serviceprices', serviceMaster.servicePrices);
router.get('/:id', serviceMaster.getService);
// insights
router.get('/:id/insights', insightsValidator, insights);
router.patch('/modifier/:serviceModifierId', toggleModifierValidator, toggleModifier);
router.patch('/archive/:serviceId', archiveServicesValidator, archiveServices);

module.exports = router;
