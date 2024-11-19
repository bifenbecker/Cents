const Joi = require('@hapi/joi');
const validateEmployeeCode = require('../../validateEmployeeCode');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        barcode: Joi.array().items(Joi.string().optional().allow(null)).min(1),
        status: Joi.string()
            .valid(
                'IN_TRANSIT_TO_HUB',
                'IN_TRANSIT_TO_STORE',
                'DROPPED_OFF_AT_STORE',
                'DROPPED_OFF_AT_HUB',
            )
            .required(),
        employeeCode: Joi.string().optional().allow(null),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function verifyRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { requiresEmployeeCode } = req.currentStore.settings;
        const { employeeCode } = req.body;
        if (requiresEmployeeCode) {
            await validateEmployeeCode(
                employeeCode,
                req.currentStore.businessId,
                req.currentStore.id,
            );
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = verifyRequest;
