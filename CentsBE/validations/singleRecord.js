const Joi = require('@hapi/joi');
const CentsCustomer = require('../models/centsCustomer');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.string()
            .regex(new RegExp('^[0-9]+$'))
            .required()
            .error(new Error('id must be a positive integer.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ id });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        if (id < 1) {
            res.status(422).json({
                error: 'id must be greater than equal to 1',
            });
            return;
        }
        const customer = await CentsCustomer.query().findById(id);
        if (!customer) {
            res.status(404).json({
                error: 'Customer not found.',
            });
            return;
        }
        req.constants = req.constants || {};
        req.constants.customer = customer;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
