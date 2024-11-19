const router = require('express').Router();

const detach = require('./detachAccount');
const register = require('./connectStripe');
const details = require('./accountDetails');
const getAccounts = require('./getBankAccounts');
const subscriptions = require('./getSubscriptions');
const verificationLink = require('./verificationLink');
const { addAccountToken, addAccountDetails } = require('./addBankAccount');

const merchantIdCheck = require('../../../../../validations/settings/bankAccount/hasMerchantId');
const bankAccountValidator = require('../../../../../validations/settings/bankAccount/addAccountDetails');
const verificationLinkValidator = require('../../../../../validations/settings/bankAccount/verificationLink');

router.get('/', details);
router.post('/register', register);
router.post('/detach', merchantIdCheck, detach);
router.get('/accounts', merchantIdCheck, getAccounts);
router.post('/add', merchantIdCheck, addAccountToken);
router.get('/subscriptions', merchantIdCheck, subscriptions);
router.post('/account-details', merchantIdCheck, bankAccountValidator, addAccountDetails);
router.get('/verification-link', merchantIdCheck, verificationLinkValidator, verificationLink);

module.exports = exports = router;
