const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function retrieveCards(req, res, next) {
    try {
        const { offset } = req.query;
        const stripeObject = {
            object: 'card',
            limit: 10,
        };
        if (offset) {
            stripeObject.starting_after = (Number(offset) - 1) * 10;
        }
        const { customer } = req.constants;
        const { stripeCustomerId } = customer;
        // const cards = await stripe.customers.listSources(stripeCustomerId, stripeObject);
        const cards = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'card',
        });
        res.status(200).json({
            success: true,
            cards,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = retrieveCards;
