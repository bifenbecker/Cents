const router = require('express').Router();

// Controllers
const getQuoteForBusiness = require('./getQuoteForBusiness');
const payForSubscription = require('./payForSubscription');

// Validations
const payForSubscriptionValidation = require('../../validations/subscription/payForSubscription');

router.get('/', getQuoteForBusiness);
router.post('/pay', payForSubscriptionValidation, payForSubscription);

module.exports = exports = router;
