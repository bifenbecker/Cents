const { task, desc } = require('jake');
const { transaction } = require('objection');

const Store = require('../models/store');
const ServiceMaster = require('../models/services');
const JakeTasksLog = require('../models/jakeTasksLog');
const ServicePrice = require('../models/servicePrices');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

/**
 * Create a ServicePrice given Store and ServiceMaster models
 *
 * @param {Object} store
 * @param {Object} serviceMaster
 * @param {void} transaction
 */
async function createIndividualPrice(store, serviceMaster, transaction) {
    await ServicePrice.query(transaction).insert({
        storeId: store.id,
        serviceId: serviceMaster.id,
        /* prettier-ignore */
        storePrice: 1.00,
        minQty: 0,
        minPrice: 0,
    });
}

/**
 * For each Delivery ServiceMaster, assign a ServicePrice for each store
 *
 * @param {Object} serviceMaster
 * @param {void} transaction
 */
async function createPriceForService(serviceMaster, transaction) {
    const stores = await Store.query();

    const services = stores.map((store) =>
        createIndividualPrice(store, serviceMaster, transaction),
    );

    return Promise.all(services);
}

desc('Create ServicePrice models for each Store and ServiceMaster');
task('create_Uber_Delivery_ServicePrices', async () => {
    let trx;
    try {
        trx = await transaction.start(ServicePrice.knex());
        const deliveryMasterServices = await ServiceMaster.query().where({
            name: 'Delivery - Uber',
        });

        const services = deliveryMasterServices.map((service) =>
            createPriceForService(service, trx),
        );

        await Promise.all(services);
        await JakeTasksLog.query(trx).insert({
            taskName: 'create_Uber_Delivery_ServicePrices',
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
