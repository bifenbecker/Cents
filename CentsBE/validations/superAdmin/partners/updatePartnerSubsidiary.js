const Joi = require('@hapi/joi');

const PartnerSubsidiary = require('../../../models/partnerSubsidiary');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        field: Joi.string().required(),
        value: Joi.any().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { field, value } = req.body;
        const { id } = req.params;
        const partnerSubsidiary = await PartnerSubsidiary.query().findById(id);

        if (!partnerSubsidiary) {
            res.status(409).json({
                error: 'Whoops! This store does not exist.',
            });
            return;
        }

        if (field === 'subsidiaryCode' && value.length !== 6) {
            res.status(422).json({
                error: 'The subsidiary access code must be 6 digits in length',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
