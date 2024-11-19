const Joi = require('@hapi/joi');

async function updateProductPrices(req, res, next) {
    try {
        const schema = Joi.object().keys({
            price: Joi.object().keys({
                isTaxable: Joi.boolean().required(),
                storePrice: Joi.number().required(),
            }),
            inventoryItemIds: Joi.array().items(Joi.number().integer().required()),
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
