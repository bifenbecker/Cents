const { task, desc } = require('jake');
const { transaction } = require('objection');

const Business = require('../models/laundromatBusiness');
const ServiceCategory = require('../models/serviceCategories');
const ServiceCategoryType = require('../models/serviceCategoryType');
const JakeTasksLog = require('../models/jakeTasksLog');
const { serviceCategoryTypes } = require('../constants/constants');

const logger = require('../lib/logger');

/**
 * Create an individual dry cleaning service category
 *
 * @param {String} type
 * @param {Number} businessId
 * @param {Number} dryCleaningCategoryId
 * @param {void} trx
 */
async function createIndividualDryCleaningCategory(type, businessId, dryCleaningCategoryId, trx) {
    await ServiceCategory.query(trx).insert({
        category: type,
        businessId,
        imageUrl: null,
        deletedAt: null,
        serviceCategoryTypeId: dryCleaningCategoryId,
    });
}

/**
 * Determine whether business has dry cleaning services and
 * create the services accordingly
 *
 * @param {Number} businessId
 * @param {Number} dryCleaningCategoryId
 * @param {void} trx
 */
async function mapDryCleaningServicesToBusiness(businessId, dryCleaningCategoryId, trx) {
    const createdServices = [];
    const dryCleaningCategories = ['CLOTHING', 'BEDDING', 'MISC.'];

    for (const category of dryCleaningCategories) {
        const categoryCreated = createIndividualDryCleaningCategory(
            category,
            businessId,
            dryCleaningCategoryId,
            trx,
        );
        createdServices.push(categoryCreated);
    }

    return createdServices;
}

/**
 * For each business, create default dry cleaning ServiceCategory entries
 */
desc('Add default ServiceCategory entries for dry cleaning');
task('add_default_dryCleaning_ServiceCategory', async () => {
    let trx;
    try {
        const businesses = await Business.query();

        const dryCleaningCategory = await ServiceCategoryType.query().findOne({
            type: serviceCategoryTypes.DRY_CLEANING,
        });

        trx = await transaction.start(ServiceCategory.knex());

        const dryCleaningServicesAdded = businesses.map((business) =>
            mapDryCleaningServicesToBusiness(business.id, dryCleaningCategory.id, trx),
        );

        await Promise.all(dryCleaningServicesAdded);
        await JakeTasksLog.query(trx).insert({
            taskName: 'add_default_dryCleaning_ServiceCategory',
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
