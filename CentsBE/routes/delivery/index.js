const router = require('express').Router();
const getEstimate = require('./getDeliveryEstimate');
const checkIfCustomerSignedIn = require('../../middlewares/liveLink/checkIfCustomerSignedIn');
const getEstimateValidator = require('../../validations/delivery/getEstimateValidator');

router.get('/estimate', checkIfCustomerSignedIn, getEstimateValidator, getEstimate);

module.exports = exports = router;
