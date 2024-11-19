const jwt = require('jsonwebtoken');
const StoreCustomer = require('../models/storeCustomer');

async function VerifyCustomerResidentialToken(req, res, next) {
    try {
        const { customerauthtoken } = req.headers;
        if (customerauthtoken) {
            const decodedToken = jwt.verify(customerauthtoken, process.env.JWT_SECRET_TOKEN);
            const customer = await StoreCustomer.query()
                .findById(decodedToken.id)
                .withGraphFetched('[centsCustomer]');
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

module.exports = exports = VerifyCustomerResidentialToken;
