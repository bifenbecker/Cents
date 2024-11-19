const Joi = require('@hapi/joi');
const knex = require('knex');
const ServiceModifier = require('../../../models/serviceModifiers');

const getBusiness = require('../../../utils/getBusiness');

function typeValidator(inputObj) {
    const schema = Joi.object().keys({
        serviceModifierId: Joi.number().integer().min(1).required(),
        isFeatured: Joi.boolean().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { serviceModifierId } = req.params;
        const isValid = typeValidator({
            serviceModifierId,
            ...req.body,
        });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { isFeatured } = isValid.value;
        const business = await getBusiness(req);
        const isModifier = await ServiceModifier.query()
            .select('modifiers.id', 'modifiers.name')
            .countDistinct({ recurringSubscriptionsCount: 'recurringSubscriptions.id' })
            .join('modifiers', 'modifiers.id', 'serviceModifiers.modifierId')
            .leftJoin('recurringSubscriptions', function leftJoinOn() {
                this.on(
                    'serviceModifiers.id',
                    knex.raw('ANY("recurringSubscriptions"."modifierIds")'),
                ).onNull('recurringSubscriptions.deletedAt');
            })
            .findOne({
                'serviceModifiers.id': serviceModifierId,
                'modifiers.businessId': business.id,
            })
            .groupBy('modifiers.id');

        if (!isModifier) {
            res.status(404).json({
                success: false,
                error: 'Modifier not found.',
                type: 'NOT_FOUND',
            });
            return;
        }

        if (!isFeatured && Number(isModifier.recurringSubscriptionsCount) > 0) {
            res.status(400).json({
                success: false,
                error: 'Cannot toggle this modifier because of some active subscriptions associated to it.',
                type: 'ACTIVE_SUBSCRIPTIONS',
                recurringSubscriptionsCount: Number(isModifier.recurringSubscriptionsCount),
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
