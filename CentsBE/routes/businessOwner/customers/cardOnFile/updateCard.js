const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function updateCardDetails(req, res, next) {
    try {
        const { id, card } = req.body;
        const patchObject = {};
        const { email, zipCode, expMonth, expYear } = card;
        if (email || zipCode) {
            patchObject.billing_details = {};
            if (email) {
                patchObject.billing_details.email = email;
            }
            if (zipCode) {
                patchObject.billing_details.address = { zipCode };
            }
        }
        if (expMonth || expYear) {
            patchObject.card = {};
            if (expMonth) {
                patchObject.card.exp_month = expMonth;
            }
            if (expYear) {
                patchObject.card.exp_year = expYear;
            }
        }
        const patchCard = await stripe.paymentMethods.update(id, patchObject);
        res.status(200).json({
            success: true,
            card: patchCard,
        });
    } catch (error) {
        if (error.code === 'resource_missing') {
            res.status(404).json({
                error: 'Card not found.',
            });
            return;
        }
        next(error);
    }
}

module.exports = exports = updateCardDetails;
