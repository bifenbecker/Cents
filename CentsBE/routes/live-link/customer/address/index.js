require('dotenv').config();

const router = require('express').Router();

// middlewares
const centsCustomerAuthToken = require('../../../../middlewares/liveLink/centsCustomerAuthToken');

// Controllers
const createCustomerAddress = require('./createCustomerAddress');
const updateCustomerAddress = require('./updateCustomerAddress');
const updateDeliveryInstructions = require('./updateDeliveryInstructions');
const manageCustomerAddress = require('./manageCustomerAddress');
const deleteCustomerAddress = require('./deleteCustomerAddress');

// Validations
const {
    validateForRequestBody: validateAddressCreation,
} = require('../../../../validations/customers/addresses/createCustomerAddress');
const {
    validateForRequestBody: validateAddressUpdate,
} = require('../../../../validations/customers/addresses/updateCustomerAddress');
const validateCustomerAddress = require('../../../../validations/liveLink/customerAddress');
const {
    validateForRequestWithParams: validateAddressDelete,
} = require('../../../../validations/customers/addresses/deleteCustomerAddress');

router.post('/create', validateAddressCreation, createCustomerAddress);
router.patch('/update', validateAddressUpdate, updateCustomerAddress);
router.patch('/instructions/update', updateDeliveryInstructions);
router.put(
    '/:googlePlacesId',
    centsCustomerAuthToken,
    validateCustomerAddress,
    manageCustomerAddress,
);

router.delete('/:id', centsCustomerAuthToken, validateAddressDelete, deleteCustomerAddress);

module.exports = exports = router;
