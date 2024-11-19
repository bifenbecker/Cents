const Joi = require('@hapi/joi');

function newCreditInputValidation(inputObj) {
    const schema = Joi.object().keys({
        businessId: Joi.number().integer().required(),
        reasonId: Joi.number().integer().required(),
        creditAmount: Joi.number().precision(6).strict().min(-100).max(100).required(),
        customerId: Joi.number().integer().required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

module.exports = newCreditInputValidation;
