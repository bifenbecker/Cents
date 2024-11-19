const isEmpty = require('lodash/isEmpty');

/**
 * Take incoming payload and format it for Stripe's data model
 *
 * @param {Object} request
 * @param {Object} customer
 */
async function formatStripeData(request, customer) {
    const formattedData = {};
    const { address } = request;

    if (!isEmpty(address)) {
        formattedData.address = {
            line1: address.address1,
            city: address.city,
            country: 'US',
            postal_code: address.postalCode,
            state: address.firstLevelSubdivisionCode,
        };
    }

    formattedData.email = customer.email;
    formattedData.name = `${customer.firstName} ${customer.lastName}`;
    formattedData.phone = customer.phoneNumber;

    return formattedData;
}

module.exports = exports = formatStripeData;
