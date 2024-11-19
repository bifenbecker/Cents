const Joi = require('@hapi/joi');

const Modifier = require('../../../models/modifiers');

const getBusiness = require('../../../utils/getBusiness');
const formatError = require('../../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().min(1).required(),
        name: Joi.string().trim().min(3).required(),
        price: Joi.number().precision(3).strict().min(0).required(),
    });
    const validate = Joi.validate(inputObj, schema, { convert: false });
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({
            id: Number(id),
            ...req.body,
        });
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        // check if modifier is associated with current business or not.
        const business = await getBusiness(req);
        const isModifier = await Modifier.query().findOne({
            id,
            businessId: business.id,
        });
        if (!isModifier) {
            res.status(422).json({
                error: 'Modifier not found.',
            });
            return;
        }
        // check if name is associated with any other modifier or not.
        const isName = await Modifier.query()
            .where('name', 'ilike', req.body.name.trim())
            .andWhere('businessId', business.id)
            .whereNot('id', id);
        if (isName.length) {
            res.status(409).json({
                error: 'Name already exists.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}
module.exports = exports = validateRequest;
