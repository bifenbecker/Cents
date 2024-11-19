const Joi = require('@hapi/joi');

const ServiceCategory = require('../../models/serviceCategories');

const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().min(1).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.params);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const { id } = req.params;
        const isService = await ServiceCategory.query()
            .select('serviceCategories.*')
            .join('servicesMaster', 'servicesMaster.serviceCategoryId', 'serviceCategories.id')
            .where({
                'serviceCategories.businessId': business.id,
                'servicesMaster.id': Number(id),
                'servicesMaster.deletedAt': null,
            });
        if (!isService.length) {
            res.status(404).json({
                error: 'Service not found',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
