const jwt = require('jsonwebtoken');
const CentsCustomer = require('../../models/centsCustomer');

async function validateCustomer(req, res, next) {
    try {
        const { customerauthtoken } = req.headers;
        if (customerauthtoken) {
            const decodedToken = jwt.verify(
                customerauthtoken,
                process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
            );
            const customer = await CentsCustomer.query().findById(decodedToken.id);
            if (customer) {
                req.currentCustomer = customer;
                next();
            } else {
                res.status(404).json({
                    error: 'Customer could not be found',
                });
            }
        } else {
            res.status(401).json({
                error: 'Please provide customerToken to proceed.',
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateCustomer;
