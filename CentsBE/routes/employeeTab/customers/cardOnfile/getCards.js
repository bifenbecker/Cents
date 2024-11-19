const stripe = require('../../../../stripe/stripeWithSecret');

async function getCards(req, res, next) {
    try {
        const { customer } = req.constants;
        const { stripeCustomerId } = customer;
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

module.exports = exports = getCards;
