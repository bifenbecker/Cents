const Joi = require('@hapi/joi');
const ServiceOrder = require('../../models/serviceOrders');
const verifyStore = require('../Regions/checkStore');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        offersFullService: Joi.boolean().required(),
        storeId: Joi.number().integer().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        req.body.storeId = id;
        const isTypeValid = typeValidations(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const { error, store } = await verifyStore(business, id);
        if (error) {
            res.status(404).json({
                error,
            });
            return;
        }
        if (store.offersFullService === req.body.offersFullService) {
            res.status(409).json({
                error: store.offersFullService
                    ? 'Store already offers full service'
                    : 'Store is already a no full service store.',
            });
            return;
        }
        if (!req.body.offersFullService) {
            const activeOrders = await ServiceOrder.query()
                .where((q) => {
                    q.where('storeId', id).orWhere('hubId', id);
                })
                .whereNotIn('status', ['COMPLETED', 'CANCELLED']);
            if (activeOrders.length) {
                res.status(409).json({
                    error: 'Store has active orders. Store can not removed from full service stores.',
                });
                return;
            }
        }
        req.constants = {
            store,
        };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
