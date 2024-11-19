const { task, desc } = require('jake');
const { transaction } = require('objection');

const ServiceCategory = require('../models/serviceCategories');
const ServiceCategoryType = require('../models/serviceCategoryType');
const JakeTasksLog = require('../models/jakeTasksLog');
const { serviceCategoryTypes } = require('../constants/constants');

const logger = require('../lib/logger');

desc('Add ServiceCategoryType relations');
task('add_ServiceCategoryType_relations', async () => {
    let trx;
    try {
        const laundryServiceCategory = await ServiceCategoryType.query().findOne({
            type: serviceCategoryTypes.LAUNDRY,
        });

        trx = await transaction.start(ServiceCategory.knex());
        await ServiceCategory.query(trx).patch({
            serviceCategoryTypeId: laundryServiceCategory.id,
        });

        await JakeTasksLog.query(trx).insert({
            taskName: 'add_ServiceCategoryType_relations',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        logger.error('Error occured while adding ServiceCategoryType relations');
        logger.error(error);
    }
});
