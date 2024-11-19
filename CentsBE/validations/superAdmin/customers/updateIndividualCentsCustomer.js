const Joi = require('@hapi/joi');

const CentsCustomer = require('../../../models/centsCustomer');

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
        const centsCustomer = await CentsCustomer.query().findById(id);

        if (!centsCustomer) {
            res.status(409).json({
                error: 'Whoops! This store does not exist.',
            });
            return;
        }

        if (field === 'phoneNumber') {
            const phoneInUse = await CentsCustomer.query().where({
                phoneNumber: value,
            });

            if (phoneInUse) {
                res.status(409).json({
                    error: 'Whoops! We already have an existing customer with this phone number.',
                });
                return;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
