require('dotenv').config();

const router = require('express').Router();

const {
    authenticate,
    retrieveAccountBalance,
    debitLaundryCard,
} = require('./laundryCardController');

router.post('/authenticate', authenticate);
router.post('/account/balance', retrieveAccountBalance);
router.post('/account/debit', debitLaundryCard);

module.exports = exports = router;
