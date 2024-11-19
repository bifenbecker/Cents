const Service = require('../models/services');

async function getServices(req, res, next) {
    try {
        const { businessId } = req.constants;
        const services = await Service.query()
            .select('servicesMaster.id as serviceId')
            .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
            .where({
                'serviceCategories.businessId': businessId,
                'servicesMaster.deletedAt': null,
                'serviceCategories.category': 'PER_POUND',
            });
        req.constants.services = services;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getServices;
