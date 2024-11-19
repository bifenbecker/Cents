const { task, desc } = require('jake');
const { transaction } = require('objection');

const stripe = require('../routes/stripe/config');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const CentsCustomer = require('../models/centsCustomer');
const PaymentMethod = require('../models/paymentMethod');
const JakeTasksLog = require('../models/jakeTasksLog');

/**
 * Create a PaymentMethod for a CentsCustomer using a Stripe card
 *
 * @param {Object} card
 * @param {Object} customer
 * @param {void} transaction
 */
async function createPaymentMethod(card, customer, transaction) {
    await PaymentMethod.query(transaction)
        .insert({
            centsCustomerId: customer.id,
            provider: 'stripe',
            type: card.card.funding,
            paymentMethodToken: card.id,
        })
        .returning('*');
}

/**
 * Get the payment methods on file on Stripe for the customer
 *
 * @param {Object} centsCustomer
 * @param {void} transaction
 */
async function getStripePaymentMethods(centsCustomer, transaction) {
    const customer = await stripe.paymentMethods.list({
        customer: centsCustomer.stripeCustomerId,
        type: 'card',
    });

    const customerCards = customer.data;

    const newPaymentMethods = customerCards.map((card) =>
        createPaymentMethod(card, centsCustomer, transaction),
    );

    return Promise.all(newPaymentMethods);
}

desc('Add cards on file for customers to the PaymentMethod model');
task('add_cardsOnFile_to_PaymentMethod', async () => {
    let trx = null;
    try {
        const centsCustomers = await CentsCustomer.query().whereNotNull('stripeCustomerId');

        trx = await transaction.start(PaymentMethod.knex());

        const paymentMethods = centsCustomers.map((customer) =>
            getStripePaymentMethods(customer, trx),
        );

        await Promise.all(paymentMethods);
        await JakeTasksLog.query(trx).insert({
            taskName: 'add_cardsOnFile_to_PaymentMethod',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
