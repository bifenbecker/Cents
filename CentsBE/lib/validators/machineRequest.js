const Joi = require('@hapi/joi');

const baseRequest = Joi.object().keys({
    // id: Joi.string().required(),
    payload: Joi.any().required(),
    // iat: Joi.number().required(),
});

exports.baseRequest = baseRequest;
