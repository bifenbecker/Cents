const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const OwnDeliverySettings = require('../models/ownDeliverySettings');
const JakeTasksLog = require('../models/jakeTasksLog');

desc('merge pickupFeeInCents into deliveryFeeInCents');
task('merge_pickup_and_delivery_fee', async () => {
    let trx;
    try {
        trx = await transaction.start(OwnDeliverySettings.knex());
        const query = `update "ownDeliverySettings"
            set "deliveryFeeInCents" = "ownDeliverySettings"."pickupFeeInCents"+"ownDeliverySettings"."deliveryFeeInCents"`;
        await OwnDeliverySettings.query(trx).knex().raw(query);
        LoggerHandler('info', 'Migration completed');
        await JakeTasksLog.query(trx).insert({
            taskName: 'merge_pickup_and_delivery_fee',
        });
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
