const Joi = require('@hapi/joi');
const { getBusinessId, validateStores } = require('./machinesCommonValidations');
const { getReqOrigin } = require('../validationUtil');

function typeValidations(inputObj, origin) {
    const schema = Joi.object().keys({
        storeIds: Joi.array().items(Joi.number().required()).required().min(1),
    });
    let extendedSchema = schema;
    if (origin === 'EMPLOYEE_TAB') {
        extendedSchema = schema.append({
            unPairedDevicesCount: Joi.boolean().optional(),
        });
    }
    const validate = Joi.validate(inputObj, extendedSchema);
    return validate;
}

async function machineStatsValidation(req, res, next) {
    try {
        const origin = getReqOrigin(req);
        const isValid = typeValidations(req.query, origin);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        const businessId = await getBusinessId(req);
        // validating stores
        await validateStores(req.query.storeIds, businessId);
        req.constants = {};
        req.constants.origin = origin;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = machineStatsValidation;
