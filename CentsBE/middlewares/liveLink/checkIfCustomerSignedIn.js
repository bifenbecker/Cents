const jwt = require('jsonwebtoken');
const CentsCustomer = require('../../models/centsCustomer');

async function checkIfCustomerSignedIn(req, res, next) {
    try {
        const { customerauthtoken } = req.headers;
        if (customerauthtoken && customerauthtoken !== 'null') {
            const decodedToken = jwt.verify(
                customerauthtoken,
                process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
            );
            const customer = await CentsCustomer.query().findById(decodedToken.id);
            if (customer) {
                req.currentCustomer = customer;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = checkIfCustomerSignedIn;
