const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CentsCustomer = require('../../../../models/centsCustomer');

async function getIntent(req, res, next) {
    try {
        const { id } = req.params;
        const { customer } = req.constants;
        let stripeCustomerId;
        if (!customer.stripeCustomerId) {
            // create  stripeCustomerId for the customer.
            const { firstName, lastName, phoneNumber, email } = customer;
            const stripeCustomer = await stripe.customers.create({
                name: `${firstName} ${lastName}`,
                email,
                phone: phoneNumber,
            });
            await CentsCustomer.query()
                .patch({
                    stripeCustomerId: stripeCustomer.id,
                })
                .findById(id);
            // adding the card.
            stripeCustomerId = stripeCustomer.id;
        } else {
            stripeCustomerId = customer.stripCustomerId;
        }
        const intent = await stripe.setupIntents.create({
            customer: stripeCustomerId,
        });
        res.status(200).json({
            success: true,
            secret: intent.client_secret,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getIntent;
