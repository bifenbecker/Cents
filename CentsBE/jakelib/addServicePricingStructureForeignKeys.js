const { task, desc } = require('jake');
const { transaction } = require('objection');

const Service = require('../models/services');
const PricingStructure = require('../models/servicePricingStructure');
const JakeTasksLog = require('../models/jakeTasksLog');

const logger = require('../lib/logger');

/**
 * Assign a ServicePricingStructure entry for each Service
 *
 * @param {Object} service
 * @param {void} trx
 */
async function addPricingStructureToService(service, trx) {
    const { serviceCategory, id } = service;
    const { category } = serviceCategory;
    let categoryFound = null;

    if (['PER_POUND', 'FIXED_PRICE'].includes(category)) {
        categoryFound = category;
    } else {
        categoryFound = 'FIXED_PRICE';
    }

    const pricingStructure = await PricingStructure.query(trx).findOne({
        type: categoryFound,
    });

    const updatedService = await Service.query(trx)
        .patch({
            servicePricingStructureId: pricingStructure.id,
        })
        .findById(id)
        .returning('*');

    return updatedService;
}

/**
 * For each ServiceMaster entry, determine the category of the item
 * and apply a pricingStructure accordingly
 */
desc('Add ServcePricingStructure foreign keys to each ServiceMaster entry');
task('add_ServicePricingStructureId_to_Services', async () => {
    let trx;
    try {
        trx = await transaction.start(Service.knex());
        const services = await Service.query(trx).withGraphFetched('serviceCategory');

        const updatedServices = services.map((service) =>
            addPricingStructureToService(service, trx),
        );

        await Promise.all(updatedServices);
        await JakeTasksLog.query(trx).insert({
            taskName: 'add_ServicePricingStructureId_to_Services',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        logger.error('Error adding default ServiceCategory entries for dry cleaning');
        logger.error(error);
    }
});
