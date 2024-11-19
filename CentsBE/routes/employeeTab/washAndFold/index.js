const router = require('express').Router();
const detergentTypes = require('./detergentType');
const regularLaundryPrice = require('./regularLaundryPrice');
const featuredModifiers = require('./getFeaturedModifiers');

const {
    getLaundryCategories,
    getDryCleaningCategories,
    getIndividualService,
} = require('./servicesController');

const featuredModifiersValidation = require('../../../validations/employeeTab/washAndFold/getFeaturedModifiers');

router.get('/detergent-type', detergentTypes);
router.get('/price', regularLaundryPrice);
router.get('/services/categories/laundry', getLaundryCategories);
router.get('/services/categories/dry-cleaning', getDryCleaningCategories);
router.get('/featured/:serviceId/modifiers', featuredModifiersValidation, featuredModifiers);
router.get('/services/service-price/:servicePriceId', getIndividualService);

module.exports = exports = router;
