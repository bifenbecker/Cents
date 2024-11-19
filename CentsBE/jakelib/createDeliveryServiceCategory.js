const { task, desc } = require('jake');
const { transaction } = require('objection');

const Business = require('../models/laundromatBusiness');
const ServiceCategory = require('../models/serviceCategories');
const JakeTasksLog = require('../models/jakeTasksLog');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

/**
 * Create a DELIVERY ServiceCategory for a given businessId
 *
 * @param {Number} businessId
 * @param {void} transaction
 */
async function createCategoryForBusiness(businessId, transaction) {
    await ServiceCategory.query(transaction).insert({
        category: 'DELIVERY',
        businessId,
    });
}

desc('Create a DELIVERY ServiceCategory for each LaundromatBusiness');
task('create_Delivery_ServiceCategory', async () => {
    let trx;
    try {
        trx = await transaction.start(ServiceCategory.knex());
        const businesses = await Business.query();

        const categories = businesses.map((business) =>
            createCategoryForBusiness(business.id, trx),
        );

        await Promise.all(categories);
        await JakeTasksLog.query(trx).insert({
            taskName: 'create_Delivery_ServiceCategory',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler(
            'error',
            'Error occured while create DELIVERY ServiceCategory for each business',
        );
        LoggerHandler('error', error);
    }
});
