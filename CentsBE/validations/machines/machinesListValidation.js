const Joi = require('@hapi/joi');
const { getBusinessId, validateStores } = require('./machinesCommonValidations');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        storeIds: Joi.array().items(Joi.number().integer().required().min(1)).required().min(1),
        page: Joi.number().integer().required().min(1),
        type: Joi.string().valid(['WASHER', 'DRYER']),
        keyword: Joi.string(),
        unPairedDevicesCount: Joi.boolean(),
        isPaired: Joi.boolean(),
        limit: Joi.number().integer().min(1).optional(),
    });
    return Joi.validate(inputObj, schema, { abortEarly: false });
}

async function machinesListValidation(req, res, next) {
    try {
        req.query.limit = Number(req.query.limit || 25);
        const isValid = typeValidations(req.query);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        const businessId = await getBusinessId(req);

        await validateStores(req.query.storeIds, businessId);

        const { isPaired } = req.query;
        if (isPaired !== undefined) {
            req.query.isPaired = JSON.parse(isPaired);
        }

        req.constants = { businessId };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = machinesListValidation;
