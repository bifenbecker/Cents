async function validateRequest(req, res, next) {
    try {
        const { customer } = req.constants;
        if (!customer.stripeCustomerId) {
            res.status(422).json({
                error: 'Customer is not registered with stripe. Please create an intent for registering.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
