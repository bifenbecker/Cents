const Joi = require('@hapi/joi');

const storesSchema = {
    allStoresCheck: Joi.string().optional(),
    stores: Joi.when('allStoresCheck', {
        is: 'true',
        then: Joi.allow(null).optional(),
        otherwise: Joi.alternatives().try(Joi.string(), Joi.array()).required().allow(null, ''),
    }),
};

module.exports = exports = storesSchema;
