const Joi = require('@hapi/joi');
const ServiceMaster = require('../../models/services');
const ServiceCategory = require('../../models/serviceCategories');

const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().required(),
        name: Joi.string()
            .required()
            .min(1)
            .trim()
            .error(new Error('Service name cannot be empty.')),
        description: Joi.string().trim().allow(null, '').optional(),
        serviceCategoryId: Joi.number().integer().required(),
        hasMinPrice: Joi.boolean().optional(),
        servicePricingStructureId: Joi.number().integer().required(),
        piecesCount: Joi.number().allow(null, '').optional(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function checkName(name, serviceCategoryId, serviceId) {
    let isService = ServiceMaster.query()
        .select('serviceCategories.category', 'servicesMaster.name')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .where('servicesMaster.name', 'ilike', name)
        .andWhere('servicesMaster.deletedAt', null);
    isService = serviceCategoryId
        ? isService.where({
              'serviceCategories.id': serviceCategoryId,
          })
        : isService;
    isService = serviceId
        ? isService
              .where('servicesMaster.id', '<>', serviceId)
              .andWhere('servicesMaster.isDeleted', false)
        : isService;
    isService = await isService;
    return isService;
}

async function verifyFields(req, res, next) {
    try {
        const { id } = req.params;
        req.body.id = id;
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        if (req.body.name.trim().length < 2) {
            res.status(422).json({
                error: 'Service name should have at least 2 characters.',
            });
            return;
        }

        const isService = await ServiceMaster.query().findById(req.body.id);
        if (isService.isDeleted) {
            res.status(409).json({
                error: 'Cannot update an archived service.',
            });
            return;
        }
        if (!isService || isService.deletedAt) {
            res.status(404).json({
                error: 'Service not found.',
            });
            return;
        }
        // check if category is valid or not.
        const business = await getBusiness(req);
        // check for the category.
        const isCategory = await ServiceCategory.query().findOne({
            businessId: business.id,
            id: req.body.serviceCategoryId,
            deletedAt: null,
        });
        if (!isCategory) {
            res.status(404).json({
                error: 'Category not found.',
            });
            return;
        }
        if (req.body.hasMinPrice) {
            if (req.body.minPrice < 0) {
                res.status(422).json({
                    error: 'minPrice should be positive',
                });
                return;
            }
        }
        if (req.body.name.trim().length === 0) {
            res.status(422).json({
                error: 'Service name cannot be empty',
            });
            return;
        }
        // check if the name or category is changed or not.
        if (
            req.body.name !== isService.name ||
            req.body.serviceCategoryId !== isService.serviceCategoryId
        ) {
            const nameExits = await checkName(
                req.body.name.trim(),
                req.body.serviceCategoryId,
                isService.id,
            );
            if (nameExits.length) {
                res.status(409).json({
                    error: `${req.body.name.trim()} already exists in ${
                        nameExits[0].category
                    }.Please choose a different name.`,
                });
                return;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyFields;
