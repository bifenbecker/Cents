const Joi = require('@hapi/joi');
const Machine = require('../../../models/machine');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        barcode: Joi.string()
            .min(3)
            .required()
            .error(new Error('barcode param is required and contains minimum 2 letters')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function getMachineDetailsByBarcodeValidations(req, res, next) {
    try {
        const isValid = typeValidations(req.params);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const machine = await Machine.query().findOne({ serialNumber: req.params.barcode });
        if (!machine) {
            res.status(404).json({
                error: 'Machine is not found',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getMachineDetailsByBarcodeValidations;
