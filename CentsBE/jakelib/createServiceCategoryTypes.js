const { task, desc } = require('jake');
const { transaction } = require('objection');

const ServiceCategoryType = require('../models/serviceCategoryType');
const JakeTasksLog = require('../models/jakeTasksLog');

const logger = require('../lib/logger');

const { serviceCategoryTypes } = require('../constants/constants');

/**
 * Create an individual ServiceCategoryType model for each type
 *
 * @param {String} key
 * @param {String} type
 * @param {void} trx
 */
async function createIndividualServiceCategoryType(key, type, trx) {
    const serviceCategoryType = await ServiceCategoryType.query(trx).insert({
        type,
    });

    return serviceCategoryType;
}

desc('Create ServiceCategoryType entries');
task('create_ServiceCategoryType_entries', async () => {
    let trx;
    try {
        const currentServiceCategoryTypes = await ServiceCategoryType.query();
        const categoryOptions = Object.entries(serviceCategoryTypes);
        const arrayOfCategories = [];

        if (currentServiceCategoryTypes.length > 0) {
            return logger.info('ServiceCategoryType entries already created');
        }

        trx = await transaction.start(ServiceCategoryType.knex());

        for (const [key, value] of categoryOptions) {
            const completedOption = createIndividualServiceCategoryType(key, value, trx);
            arrayOfCategories.push(completedOption);
        }

        await Promise.all(arrayOfCategories);
        await JakeTasksLog.query(trx).insert({
            taskName: 'create_ServiceCategoryType_entries',
        });

        return await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        logger.error('Error occured while creating ServiceCategoryType entries');
        return logger.error(error);
    }
});
