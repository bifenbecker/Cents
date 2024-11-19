const { getCustomerAndOrder } = require('../../services/liveLink/queries/serviceOrder');
const JwtService = require('../../services/tokenOperations/main');

async function validateCustomerAndOrder(req, res, next) {
    try {
        const { customerauthtoken } = req.headers;
        if (!customerauthtoken || !customerauthtoken.trim()) {
            res.status(401).json({
                error: 'customerauthtoken is required.',
            });
            return;
        }
        const jwtService = new JwtService(customerauthtoken);
        const verifyToken = jwtService.verifyToken(process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
        const { order } = req.constants;
        const orderDetails = await getCustomerAndOrder(order.id, verifyToken.id);
        if (!orderDetails) {
            res.status(401).json({
                error: 'Order is not associated with you. Please re-request the otp to continue.',
            });
            return;
        }
        req.constants = req.constants || {};
        req.constants.order = orderDetails;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateCustomerAndOrder;
