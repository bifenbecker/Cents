const Joi = require('@hapi/joi');
const InventoryOrder = require('../../../models/inventoryOrders');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().min(1).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validate(req, res, next) {
    try {
        const isValid = typeValidations(req.params);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { id } = req.params;
        const storeId = req.currentStore.id;
        const isOrder = await InventoryOrder.query().findOne({
            id,
            storeId,
        });
        if (!isOrder) {
            res.status(404).json({
                error: 'Order not found.',
            });
            return;
        }
        if (isOrder.status !== 'CREATED' && isOrder.status !== 'PAYMENT_REQUIRED') {
            res.status(409).json({
                error: `Current status for order is ${isOrder.status}. So, order can not be cancelled,`,
            });
            return;
        }
        if (isOrder.paymentStatus !== 'BALANCE_DUE') {
            res.status(409).json({
                error: 'Only unpaid orders can be cancelled.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validate;
