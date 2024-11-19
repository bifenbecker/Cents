const Joi = require('@hapi/joi');
const TaxRate = require('../../models/taxRate');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        taxRateId: Joi.number().integer().optional(),
        dcaLicense: Joi.string().optional().allow(null, ''),
        commercialDcaLicense: Joi.string().optional().allow(null, ''),
        locationId: Joi.number().integer().required(),
    });
    const inputObject = {
        taxRateId: inputObj.taxRateId,
        dcaLicense: inputObj.dcaLicense,
        commercialDcaLicense: inputObj.commercialDcaLicense,
        locationId: inputObj.id,
    };
    const error = Joi.validate(inputObject, schema);
    return error;
}

async function validateTaxInfo(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ ...req.body, id });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
            return;
        }
        const business = await getBusiness(req);
        const { taxRateId } = req.body;
        if (taxRateId) {
            const taxRate = await TaxRate.query().findOne({
                businessId: business.id,
                id: taxRateId,
            });
            if (!taxRate) {
                res.status(404).json({
                    error: 'tax rate not found.',
                });
                return;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateTaxInfo;
