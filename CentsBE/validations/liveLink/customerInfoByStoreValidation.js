const Joi = require('@hapi/joi');
const Store = require('../../models/store');

const typeValidation = (input) => {
    const schema = Joi.object().keys({
        storeId: Joi.number().integer().min(1).required().error(new Error('Store id is required')),
    });

    return Joi.validate(input, schema);
};

const customerInfoByStoreValidation = async (req, res, next) => {
    try {
        const isValid = typeValidation(req.params);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { storeId } = req.params;
        const store = await Store.query().findById(storeId);
        if (!store) {
            res.status(404).json({
                error: 'Store is not found',
            });
            return;
        }

        req.constants = {
            store,
        };
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = customerInfoByStoreValidation;
