// packages
const { transaction } = require('objection');

// models
const BusinessSubscription = require('../../../../../models/businessSubscription');
const User = require('../../../../../models/user');
const Business = require('../../../../../models/laundromatBusiness');

// utils
const LoggerHandler = require('../../../../../LoggerHandler/LoggerHandler');
const stripe = require('../../../../stripe/config');

/**
 * Retrieve customer details from Stripe
 *
 * @param {String} customer
 */
async function getStripeCustomer(customer) {
    const stripeCustomer = await stripe.customers.retrieve(customer);
    return stripeCustomer;
}

/**
 * Split a full name into first and last name
 *
 * @param {String} fullName
 */
function splitFullName(fullName) {
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = name.slice(1).join(' ');
    return { firstName, lastName };
}

/**
 * Create a BusinessSubscription model for an incoming Stripe Subscription
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} void
 */
async function createStripeSubscription(req, res, next) {
    let trx = null;

    try {
        const { event } = req.constants;
        const subscriptionObject = event.data.object;

        const stripeCustomer = await getStripeCustomer(subscriptionObject.customer);
        const { firstName, lastName } = splitFullName(stripeCustomer.name);

        const businessOwner = await User.query().withGraphFetched('roles').findOne({
            email: stripeCustomer.email,
            firstname: firstName,
            lastname: lastName,
        });

        if (!businessOwner) {
            return res.json({
                error: 'Could not find this user based on email and name criteria.',
            });
        }

        const roles = businessOwner.roles.map((role) => role.userType);
        if (!roles.includes['Business Owner']) {
            return res.json({
                error: 'This person is not a business owner',
            });
        }

        const business = await Business.query().findOne({ userId: businessOwner.id });
        if (!business) {
            return res.json({
                error: 'Cannot find a business associated with this customer.',
            });
        }

        trx = await transaction.start(BusinessSubscription.knex());

        const subscription = await BusinessSubscription.query(trx).insert({
            businessId: business.id,
            stripeSubscriptionToken: subscriptionObject.id,
            status: subscriptionObject.status,
        });
        const updatedBusiness = await Business.query(trx)
            .patch({
                subscriptionId: subscription.id,
                stripeCustomerToken: stripeCustomer.id,
            })
            .findById(business.id)
            .returning('*');

        return res.json({
            success: true,
            subscription,
            business: updatedBusiness,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error, req);
        return next(error);
    }
}

module.exports = exports = createStripeSubscription;
