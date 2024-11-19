const Joi = require('@hapi/joi');
const Store = require('../../models/store');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        stores: Joi.array()
            .items(
                Joi.number()
                    .integer()
                    .min(1)
                    .error(() => 'id must be greater than equal to 1.')
                    .required(),
            )
            .min(1)
            .required(),
    });
    const validate = Joi.validate(inputObj, schema, { abortEarly: false });
    return validate;
}
async function validateRequest(req, res, next) {
    try {
        const { stores } = req.query;
        const isValid = typeValidations({ stores });
        if (isValid.error) {
            const str = isValid.error.message.split('[');
            let errString = '';
            for (let i = 1; i < str.length; i++) {
                const temp = str[i].split(']');
                for (const j of temp) {
                    errString += ` ${j.split(']')[0]}.`;
                }
            }
            res.status(422).json({
                error: errString,
            });
            return;
        }
        const business = await getBusiness(req);
        const areStoresValid = await Store.query()
            .whereIn('id', stores)
            .andWhere('businessId', business.id);
        if (areStoresValid.length !== stores.length) {
            res.status(409).json({
                error: 'Invalid store id(s).',
            });
            return;
        }
        req.constants = { business };
        next();
    } catch (error) {
        next(error);
    }
}
module.exports = exports = validateRequest;
