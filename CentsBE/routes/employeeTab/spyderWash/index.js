const router = require('express').Router();

// Controller methods
const {
    retrieveSpyderWashAuthToken,
    checkSpyderWashCardBalance,
    deductBalanceFromSpyderWashCard,
} = require('./spyderWashController');

router.get('/authentication', retrieveSpyderWashAuthToken);
router.post('/balance', checkSpyderWashCardBalance);
router.post('/deduct', deductBalanceFromSpyderWashCard);

module.exports = exports = router;
