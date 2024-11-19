const router = require('express').Router();

// Controller methods
const {
    getIndividualCustomer,
    updateIndividualCustomer,
    uploadCustomerList,
    getCentsCustomers,
    addCreditToCustomer,
    getCreditReasons,
} = require('./centsCustomerController');

// Validations
const updateIndividualCustomerValidation = require('../../../validations/superAdmin/customers/updateIndividualCentsCustomer');
const uploadCustomerListValidation = require('../../../validations/superAdmin/customers/uploadCustomerList');

router.get('/', getCentsCustomers);
router.get('/reasons', getCreditReasons);
router.post('/upload', uploadCustomerListValidation, uploadCustomerList);
router.get('/:id', getIndividualCustomer);
router.put('/:id/update', updateIndividualCustomerValidation, updateIndividualCustomer);
router.put('/:id/update/credit', addCreditToCustomer);

module.exports = exports = router;
