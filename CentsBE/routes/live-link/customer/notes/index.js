const router = require('express').Router();

// Middleware & Validators
const centsCustomerAuthToken = require('../../../../middlewares/liveLink/centsCustomerAuthToken');
const updateCustomerNotesValidation = require('../../../../validations/liveLink/customer/notes/updateCustomerNotes');

// API Logic
const updateCustomerNotes = require('./updateCustomerNotes');

router.patch(
    '/:storeCustomerId/update',
    centsCustomerAuthToken,
    updateCustomerNotesValidation,
    updateCustomerNotes,
);

module.exports = exports = router;
