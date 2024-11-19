const { task, desc } = require('jake');
const { transaction } = require('objection');

const PricingStructure = require('../models/servicePricingStructure');
const JakeTasksLog = require('../models/jakeTasksLog');

const logger = require('../lib/logger');

const { pricingStructureTypes } = require('../constants/constants');

/**
 * Create an individual ServicePricingStructure model for each type
 *
 * @param {String} key
 * @param {String} type
 * @param {void} trx
 */
async function createIndividualPricingStructure(key, type, trx) {
    const pricingStructure = await PricingStructure.query(trx).insert({
        type,
    });

    return pricingStructure;
}

desc('Create ServicePricingStructure entries');
task('create_ServicePricingStructure_entries', async () => {
    let trx;
    try {
        const currentServiceCategoryTypes = await PricingStructure.query();
        const pricingOptions = Object.entries(pricingStructureTypes);
        const arrayOfCategories = [];

        if (currentServiceCategoryTypes.length > 0) {
            return logger.info('ServiceCategoryType entries already created');
        }

        trx = await transaction.start(PricingStructure.knex());

        for (const [key, value] of pricingOptions) {
            const completedOption = createIndividualPricingStructure(key, value, trx);
            arrayOfCategories.push(completedOption);
        }

        await Promise.all(arrayOfCategories);
        await JakeTasksLog.query(trx).insert({
            taskName: 'create_ServicePricingStructure_entries',
        });

        return await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        logger.error('Error occured while creating ServicePricingStructure entries');
        return logger.error(error);
    }
});
