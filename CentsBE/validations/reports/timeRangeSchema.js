const Joi = require('@hapi/joi');

const timeRangeSchema = {
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    timeZone: Joi.string().required(),
};

module.exports = exports = timeRangeSchema;
