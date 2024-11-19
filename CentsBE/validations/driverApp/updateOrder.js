const Joi = require('@hapi/joi');
const ServiceOrder = require('../../models/serviceOrders');
const ServiceOrderBags = require('../../models/serviceOrderBags');
const formatError = require('../../utils/formatError');

async function typeValidations(req, res, next) {
    try {
        const schema = Joi.object().keys({
            serviceOrderId: Joi.number().required(),
            serviceBagId: Joi.number().required(),
            status: Joi.string().required(),
        });
        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        const { serviceOrderId, serviceBagId } = req.body;
        const serviceOrder = await ServiceOrder.query().findById(serviceOrderId);
        if (serviceOrder === null) throw new Error('SERVICE_ORDER_ID_DOES_NOT_EXIST');
        if (!serviceOrder.isProcessedAtHub) throw new Error('SERVICE_ORDER_DOESNT_PROCESS_AT_HUB');
        const serviceOrderBags = await ServiceOrderBags.query().findById(serviceBagId);
        if (serviceOrderBags === null) throw new Error('SERVICE_BAGS_ID_DOES_NOT_EXIST');
        if (!serviceOrderBags.serviceOrderId === serviceOrder.id) throw new Error('ID_MISMATCH');

        next();
    } catch (error) {
        switch (error.message) {
            case 'SERVICE_ORDER_ID_DOES_NOT_EXIST':
                res.status(422).json({
                    error: "ServiceOrderId doesn't exist",
                });
                break;
            case 'SERVICE_ORDER_DOESNT_PROCESS_AT_HUB':
                res.status(422).json({
                    error: "ServiceOrder doesn't process at hub",
                });
                break;
            case 'ID_MISMATCH':
                res.status(422).json({
                    error: "ServiceOrderId  doesn't belong to serviceBagId",
                });
                break;
            case 'SERVICE_BAGS_ID_DOES_NOT_EXIST':
                res.status(422).json({
                    error: "serviceBagId doesn't exist",
                });
                break;
            default:
                next(error);
                break;
        }
    }
}

module.exports = exports = typeValidations;
