const Joi = require('@hapi/joi');
const { SHIFT_TYPES } = require('../../lib/constants');

async function getShiftsValidations(req, res, next) {
    const { query } = req;
    const schema = Joi.object().keys({
        storeId: Joi.number().required(),
        type: Joi.string().valid(
            SHIFT_TYPES.SHIFT,
            SHIFT_TYPES.CENTS_DELIVERY,
            SHIFT_TYPES.OWN_DELIVERY,
        ),
    });
    const { error } = Joi.validate(query, schema);
    if (!error) {
        next();
    } else {
        res.status(422).json({
            error: error.details[0].message,
        });
    }
}

module.exports = {
    getShiftsValidations,
};
