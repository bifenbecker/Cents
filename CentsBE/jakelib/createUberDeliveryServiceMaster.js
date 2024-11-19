const { task, desc } = require('jake');
const { transaction } = require('objection');

const ServiceCategory = require('../models/serviceCategories');
const ServiceMaster = require('../models/services');
const JakeTasksLog = require('../models/jakeTasksLog');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

/**
 * Create an Uber ServiceMaster for a given ServiceCategory of category DELIVERY
 *
 * @param {Number} serviceCategoryId
 * @param {void} transaction
 */
async function createServiceForDeliveryCategory(serviceCategoryId, transaction) {
    await ServiceMaster.query(transaction).insert({
        description: 'Uber delivery service',
        name: 'Delivery - Uber',
        serviceCategoryId,
    });
}

desc('Create an Uber Delivery ServiceMaster for each ServiceCategory');
task('create_Uber_Delivery_ServiceMaster', async () => {
    let trx;
    try {
        trx = await transaction.start(ServiceMaster.knex());
        const deliveryCategories = await ServiceCategory.query().where({
            category: 'DELIVERY',
        });

        const services = deliveryCategories.map((business) =>
            createServiceForDeliveryCategory(business.id, trx),
        );

        await Promise.all(services);
        await JakeTasksLog.query(trx).insert({
            taskName: 'create_Uber_Delivery_ServiceMaster',
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
