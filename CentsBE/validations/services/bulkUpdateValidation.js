const Joi = require('@hapi/joi');

async function updateProductPrices(req, res, next) {
    try {
        const schema = Joi.object().keys({
            price: Joi.object().keys({
                isTaxable: Joi.boolean().required(),
                minPrice: Joi.number().when('hasMinPrice', {
                    is: true,
                    then: Joi.number().required().error(new Error('Price should be positive')),
                    otherwise: Joi.allow(null).optional(),
                }),
                minQty: Joi.number().when('hasMinPrice', {
                    is: true,
                    then: Joi.number().required().error(new Error('Quantity should be positive')),
                    otherwise: Joi.allow(null).optional(),
                }),
                storePrice: Joi.number().required(),
            }),
            servicePriceIds: Joi.array().items(Joi.number().integer().required()),
        });

        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateProductPrices;
