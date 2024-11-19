const Joi = require('@hapi/joi');

const Store = require('../../../models/store');
const getBusiness = require('../../../utils/getBusiness');
const { locationType } = require('../../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number()
            .integer()
            .min(1)
            .required()
            .error(new Error('id of type integer is required.')),
        isIntakeOnly: Joi.boolean()
            .required()
            .error(new Error('isIntakeOnly of type boolean is required')),
    });
    const isValid = Joi.validate(inputObj, schema);
    return isValid;
}

async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        const { isIntakeOnly } = req.body;
        const isValid = typeValidations({ id, isIntakeOnly });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const isStore = await Store.query().findOne({
            id,
            businessId: business.id,
        });
        if (!isStore) {
            res.status(404).json({
                error: 'Store not found.',
            });
            return;
        }
        if (isStore.type === locationType.HUB) {
            res.status(409).json({
                error: 'Can not convert a hub to intake only location.',
            });
            return;
        }

        if (!isStore.hubId) {
            res.status(409).json({
                error:
                    'Unable to convert store to intake only,' +
                    'as store is not associated with a hub.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
