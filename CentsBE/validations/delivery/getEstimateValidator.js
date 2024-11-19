const Joi = require('joi');
const Orders = require('../../models/orders');

const JwtService = require('../../services/tokenOperations/main');

async function validateRequest(req, res, next) {
    try {
        const validator = Joi.object({
            storeId: Joi.number().required(),
            token: Joi.string().trim().optional(),
        });

        const { error } = validator.validate(req.query);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }

        req.constants = req.constants || {};
        let { token: orderToken } = req.query;

        if (orderToken) {
            orderToken = orderToken.replace(/'|'/g, '');
            const jwtService = new JwtService(orderToken);
            const serviceOrder = jwtService.verifyToken(process.env.JWT_SECRET_TOKEN_ORDER);

            const masterOrder = await Orders.query()
                .where({
                    orderableId: serviceOrder.id,
                    orderableType: 'ServiceOrder',
                })
                .first();

            req.constants.orderId = masterOrder.id;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
