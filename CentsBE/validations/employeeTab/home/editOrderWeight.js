const Joi = require('@hapi/joi');
const ServiceOrderWeight = require('../../../models/serviceOrderWeights');
const validateEmployeeCode = require('../../validateEmployeeCode');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        totalWeight: Joi.number().required(),
        serviceOrderId: Joi.number().integer().required(),
        serviceOrderWeightId: Joi.number().integer().required(),
        employeeCode: Joi.string().optional().allow(null),
        editReason: Joi.string().optional().allow(null, ''),
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
        if (requiresEmployeeCode) {
            await validateEmployeeCode(
                req.body.employeeCode,
                req.currentStore.businessId,
                req.currentStore.id,
            );
        }
        const { serviceOrderId, serviceOrderWeightId } = req.body;

        const isWeight = await ServiceOrderWeight.query().findOne({
            serviceOrderId,
            id: serviceOrderWeightId,
        });
        if (!isWeight) {
            res.status(404).json({
                error: 'Weight not found.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = verifyRequest;
