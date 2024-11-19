const Joi = require('@hapi/joi');
const { serviceTypes } = require('../../../constants/constants');
const { getReqOrigin } = require('../../validationUtil');
const { validateBusinessValidation } = require('../unpairDevice');
const validateEmployeeCode = require('../../validateEmployeeCode');

function typeValidations(inputObj, requiresEmployeeCode) {
    const schema = Joi.object().keys({
        centsCustomerId: Joi.when('serviceType', {
            is: serviceTypes.FULL_SERVICE,
            then: Joi.number().required(),
        }),
        machineId: Joi.number().required(),
        quantity: Joi.number(),
        storeId: Joi.number().required(),
    });
    let extendedSchema = schema;
    if (requiresEmployeeCode) {
        extendedSchema = schema.append({
            employeeCode: Joi.number().required(),
        });
    } else {
        extendedSchema = schema.append({
            employeeCode: Joi.number().optional().allow('', null),
        });
    }

    const validate = Joi.validate(inputObj, extendedSchema);
    if (validate.error) {
        throw new Error(validate.error.details[0].message);
    }
}

async function createTurnValidation(req, res, next) {
    try {
        const source = getReqOrigin(req);
        const { requiresEmployeeCode } = req.currentStore.settings;
        typeValidations(req.body, requiresEmployeeCode);
        const { businessId, userId } = await validateBusinessValidation(req, source);
        if (requiresEmployeeCode) {
            await validateEmployeeCode(
                req.body.employeeCode,
                req.currentStore.businessId,
                req.currentStore.id,
            );
        }
        req.body.userId = userId;
        req.constants = { businessId, source };
        req.body.origin = source;
        req.body.isHub = req.currentStore.isHub;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = createTurnValidation;
