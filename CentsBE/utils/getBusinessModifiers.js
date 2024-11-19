const Modifiers = require('../models/modifiers');
const ServiceCategory = require('../models/serviceCategories');
const ServicePricingStructure = require('../models/servicePricingStructure');

async function getModifiers(req, res, next) {
    try {
        const { serviceCategoryId, servicePricingStructureId } = req.body;
        req.constants = req.constants || {};
        const category = await ServiceCategory.query().findById(serviceCategoryId);
        const servicePricingStructure = await ServicePricingStructure.query().findById(
            servicePricingStructureId,
        );
        if (!category) {
            res.status(404).json({
                error: 'Category not found.',
            });
            return;
        }
        if (servicePricingStructure.type === 'PER_POUND') {
            const { businessId } = category;
            const modifiers = await Modifiers.query().select('id as modifierId').where({
                businessId,
            });
            req.constants.modifiers = modifiers;
        }
        req.constants.category = category.category;
        req.constants.servicePricingStructure = servicePricingStructure;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getModifiers;
