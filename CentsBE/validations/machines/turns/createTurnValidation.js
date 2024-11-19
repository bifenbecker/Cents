const Joi = require('@hapi/joi');
const { serviceTypes } = require('../../../constants/constants');
const { getReqOrigin } = require('../../validationUtil');
const { validateBusinessValidation } = require('../unpairDevice');

function typeValidations(req, origin) {
    const schema = Joi.object().keys({
        serviceType: Joi.string()
            .valid([
                serviceTypes.CUSTOMER_SERVICE,
                serviceTypes.TECHNICAL_SERVICE,
                serviceTypes.FULL_SERVICE,
            ])
            .required(),
        technicianName: Joi.when('serviceType', {
            is: serviceTypes.TECHNICAL_SERVICE,
            then: Joi.string().required(),
        }),
        note: Joi.string(),
        centsCustomerId: Joi.when('serviceType', {
            is: serviceTypes.FULL_SERVICE,
            then: Joi.number().required(),
            otherwise: Joi.when('serviceType', {
                is: serviceTypes.CUSTOMER_SERVICE,
                then: Joi.number().required(),
            }),
        }),
        quantity: Joi.number(),
    });
    let extendedSchema = schema;
    if (origin === 'EMPLOYEE_TAB' && req.currentStore.settings.requiresEmployeeCode) {
        extendedSchema = schema.append({
            employeeCode: Joi.number().required(),
        });
    }
    const validate = Joi.validate(req.body, extendedSchema);
    if (validate.error) {
        throw new Error(validate.error.details[0].message);
    }
}

async function createTurnValidation(req, res, next) {
    try {
        const source = getReqOrigin(req);
        typeValidations(req, source);
        const { userId, businessId } = await validateBusinessValidation(req, source);
        req.constants = { businessId };
        req.body.userId = userId;
        req.body.origin = source;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = createTurnValidation;
