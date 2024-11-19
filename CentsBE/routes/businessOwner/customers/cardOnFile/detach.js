const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function detach(req, res, next) {
    try {
        const { id } = req.body;
        await stripe.paymentMethods.detach(id);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = detach;
