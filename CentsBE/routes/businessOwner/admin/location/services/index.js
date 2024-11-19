const router = require('express').Router({ mergeParams: true });

const updatePrices = require('./updatePrices');
const { getServices } = require('./serviceList');
const updateServicesValidations = require('../../../../../validations/locations/services/updateServices');

router.get('/', getServices);
router.put('/', updateServicesValidations, updatePrices);

module.exports = router;
