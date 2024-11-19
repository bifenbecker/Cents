const Joi = require('joi');
const getBusiness = require('../../utils/getBusiness');
const schema = require('./preference-schema');
const optionSchema = require('./option-schema');

async function validate(req, res, next) {
    const business = await getBusiness(req);
    const preferences = req.body.map((pref) => {
        pref.businessId = business.id;
        return pref;
    });

    const createPreferenceValidator = Joi.array().items(
        schema.keys({
            options: Joi.array().items(optionSchema).min(1),
        }),
    );

    const { error } = createPreferenceValidator.validate(preferences);

    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
