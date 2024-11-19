const Joi = require('@hapi/joi');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

function typeValidation(inputObj) {
    const schema = Joi.object().keys({
        storeId: Joi.number().required(),
        machinesData: Joi.array()
            .label('CSV File')
            .min(1)
            .unique('name')
            .unique('device')
            .items(
                Joi.object().keys({
                    machineModel: Joi.string().required(),
                    pricePerTurn: Joi.number().optional().allow(null, '').min(1),
                    minsPerDryer: Joi.number().integer().optional().allow(null, '').min(1).max(99),
                    name: Joi.string().required().max(8),
                    device: Joi.string().required(),
                }),
            ),
    });
    const validate = Joi.validate(inputObj, schema, { abortEarly: false });
    return validate;
}

async function csvFileValidation(req, res, next) {
    try {
        const payload = req.body;
        const isValid = typeValidation(payload);
        if (isValid.error) {
            res.status(422).json({
                error: 'CSV validation failed',
                errors: isValid.error.details.map((errorObj) => ({
                    error:
                        errorObj.context && errorObj.context.path
                            ? `${errorObj.context.path}: ${errorObj.message}`
                            : errorObj.message,
                    row: errorObj.path[1] + 2,
                })),
            });
            return;
        }
        next();
    } catch (err) {
        LoggerHandler('error', `${JSON.stringify(err)}`);
        next(err);
    }
}

module.exports = exports = csvFileValidation;
