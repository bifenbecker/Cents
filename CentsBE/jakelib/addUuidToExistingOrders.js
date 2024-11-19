const { transaction } = require('objection');

const { task, desc } = require('jake');
const Model = require('../models');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const JakeTasksLog = require('../models/jakeTasksLog');

desc('add uuid for existing orders');

task('add_uuid_for_existing_orders', async () => {
    let trx = null;

    try {
        trx = await transaction.start(Model.knex());

        const serviceOrdersQuery = `UPDATE "serviceOrders"
            SET uuid = uuid_generate_v4()
            WHERE uuid IS NULL`;

        const inventoryOrdersQuery = `UPDATE "inventoryOrders"
            SET uuid = uuid_generate_v4()
            WHERE uuid IS NULL`;

        await Model.query(trx).knex().raw(serviceOrdersQuery);
        await Model.query(trx).knex().raw(inventoryOrdersQuery);

        await JakeTasksLog.query(trx).insert({
            taskName: 'add_uuid_for_existing_orders',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
