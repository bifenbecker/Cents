const router = require('express').Router();
const listPricingTiers = require('./pricingTiers');

const {
    getServiceAndProductPrice,
    updateServicePrice,
    updateProductPrice,
} = require('./servicePriceController');
const tierPriceServiceValidation = require('../../../../validations/tiers/tierPriceServiceValidation');

const tiersListingValidator = require('../../../../validations/tiers/list');
const tierDetailsValidator = require('../../../../validations/tiers/tierdetailsValidator');
const tierValidationValidator = require('../../../../validations/tiers/tierValidationsValidator');
const { tierDetails } = require('./tierDetailsController');
const validateTier = require('./validateTier');
const updateServicePriceValidation = require('../../../../validations/tiers/updateServicePriceValidation');
const updateProductPriceValidation = require('../../../../validations/tiers/updateProductPriceValidation');

const createTier = require('./createTier');
const createTierValidations = require('../../../../validations/tiers/createTier');

const updateTier = require('./updateTier');
const updateTierValidator = require('../../../../validations/tiers/updateTier');

const updateDeliverableServices = require('./updateTierDeliverableServices');
const updateDeliverableServicesValidator = require('../../../../validations/tiers/updateDeliverableServicesValidator');
const deliverableServicesValidator = require('../../../../validations/tiers/deliverableServicesValidator');

router.post('/create', createTierValidations, createTier);
router.get('/:id/services-products', tierPriceServiceValidation, getServiceAndProductPrice);
router.get('/', tiersListingValidator, listPricingTiers);
router.get('/:id', tierDetailsValidator, tierDetails);
router.patch('/service-price', updateServicePriceValidation, updateServicePrice);
router.patch('/product-price', updateProductPriceValidation, updateProductPrice);
router.patch('/:id', updateTierValidator, updateTier);
router.post('/validation', tierValidationValidator, validateTier);
router.put(
    '/:id/deliverable-services',
    updateDeliverableServicesValidator,
    deliverableServicesValidator,
    updateDeliverableServices,
);

module.exports = exports = router;
