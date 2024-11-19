const { task, desc } = require('jake');
const JakeTasksLog = require('../models/jakeTasksLog');
const Model = require('../models');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Updating thirdPartyDeliveryCostInCents in orderDeliveries');

task('update_thirdPartyDeliveryCostInCents_of_doordash_deliveries', async () => {
    try {
        const updateQuery = `
            update "orderDeliveries" 
            set "thirdPartyDeliveryCostInCents"= ((COALESCE("totalDeliveryCost", 0) * 100) + COALESCE("subsidyInCents", 0))
            where "deliveryProvider" = 'DOORDASH' AND "thirdPartyDeliveryCostInCents"=0
        `;
        await Model.query().knex().raw(updateQuery);
        await JakeTasksLog.query().insert({
            taskName: 'update_thirdPartyDeliveryCostInCents_of_doordash_deliveries',
        });
    } catch (error) {
        LoggerHandler('error', error);
    }
});
