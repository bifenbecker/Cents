const stripe = require('../../../routes/stripe/config');
const CentsCustomer = require('../../../models/centsCustomer');
const CreditHistory = require('../../../models/creditHistory');
const { PAYMENT_METHOD_PROVIDERS } = require('../../../constants/constants');

/**
 * Format the customer payment methods to include stripe details
 *
 * @param {Object} paymentMethod
 */
async function getStripeCardDetails(paymentMethod) {
    const response = {};

    if (paymentMethod.provider === PAYMENT_METHOD_PROVIDERS.STRIPE) {
        const stripeMethod = await stripe.paymentMethods.retrieve(paymentMethod.paymentMethodToken);

        response.last4 = stripeMethod.card.last4;
        response.brand = stripeMethod.card.brand;
    } else {
        response.last4 = null;
        response.brand = null;
    }

    response.centsCustomerId = paymentMethod.centsCustomerId;
    response.provider = paymentMethod.provider;
    response.type = paymentMethod.type;
    response.paymentMethodToken = paymentMethod.paymentMethodToken;
    response.id = paymentMethod.id;

    return response;
}

async function getCustomerInformationUow(payload) {
    try {
        const { id, storeId, businessId, transaction } = payload;
        const newPayload = payload;
        const customer = await CentsCustomer.query(transaction)
            .select('firstName', 'lastName', 'phoneNumber', 'centsCustomers.id')
            .where(`${CentsCustomer.tableName}.id`, id)
            .withGraphJoined(
                '[storeCustomers(storeFilter).businessCustomer(businessCustomerFilter), paymentMethods, addresses(addressFilter)]',
            )
            .modifiers({
                storeFilter: (query) => {
                    query
                        .select(
                            'notes',
                            'isHangDrySelected',
                            'hangDryInstructions',
                            'creditAmount as availableCredits',
                            'id',
                        )
                        .where('storeId', storeId);
                },
                businessCustomerFilter: (query) => {
                    query.select('isCommercial');
                },
                addressFilter: (query) => {
                    query
                        .select(
                            'id',
                            'address1',
                            'address2',
                            'city',
                            'firstLevelSubdivisionCode',
                            'postalCode',
                            'countryCode',
                            'googlePlacesId',
                            'instructions',
                            'leaveAtDoor',
                        )
                        .whereNull('deletedAt');
                },
            })
            .first();

        if (customer.paymentMethods.length > 0) {
            let paymentMethods = customer.paymentMethods.map((method) =>
                getStripeCardDetails(method),
            );
            paymentMethods = await Promise.all(paymentMethods);
            customer.paymentMethods = paymentMethods;
        }

        const { sum } = await CreditHistory.query(transaction).sum('amount').findOne({
            customerId: id,
            businessId,
        });

        customer.availableCredits = Number(sum);
        newPayload.customer = customer;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getCustomerInformationUow;
