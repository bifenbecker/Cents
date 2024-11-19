const Joi = require('@hapi/joi');
const Machine = require('../../models/machine');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        field: Joi.string()
            .required()
            .valid('name', 'pricePerTurnInCents', 'serialNumber', 'turnTimeInMinutes'),
        value: Joi.when('field', {
            is: 'name',
            then: Joi.string().trim().min(1).max(8).required(),
            otherwise: Joi.when('field', {
                is: 'pricePerTurnInCents',
                then: Joi.number().min(1).required(),
                otherwise: Joi.when('field', {
                    is: 'serialNumber',
                    then: Joi.string().trim().allow(null, '').optional(),
                    otherwise: Joi.when('field', {
                        is: 'turnTimeInMinutes',
                        then: Joi.number().integer().min(1).max(99).required(),
                        otherwise: Joi.forbidden().error(
                            new Error(
                                'field should only have values name, pricePerTurnInCents turnTimeInMinutes and serialNumber',
                            ),
                        ),
                    }),
                }),
            }),
        }),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function updateMachineDetails(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        const { field, value } = req.body;
        const { machineId } = req.params;
        const machineDetails = await Machine.query().select('serialNumber').findById(machineId);
        if (
            field === 'serialNumber' &&
            value.trim() !== '' &&
            value !== 'null' &&
            machineDetails.serialNumber !== value
        ) {
            const machine = await Machine.query().where('serialNumber', value.trim());
            if (machine.length) {
                res.status(409).json({
                    error: 'Barcode already Exists.',
                });
                return;
            }
        }
        if (field === 'serialNumber' && value.length > 25) {
            res.status(409).json({
                error: 'Barcode length exceeded.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateMachineDetails;
