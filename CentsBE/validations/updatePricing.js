const Joi = require('@hapi/joi');

function validateAccount(inputObj) {
    const schema = Joi.object().keys({
        machineId: Joi.number().integer(),
        prices: Joi.array().items(
            Joi.object()
                .keys({
                    id: Joi.number().integer(),
                    loadId: Joi.number().integer(),
                    price: Joi.number(),
                })
                .and('id', 'loadId', 'price'),
        ),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

module.exports = exports = validateAccount;
