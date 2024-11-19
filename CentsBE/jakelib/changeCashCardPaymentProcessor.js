const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Payment = require('../models/payment');
const JakeTasksLog = require('../models/jakeTasksLog');

/**
 * For payments where paymentProcessor is 'cashCard', change value to 'ESD'
 *
 * @param {Number} paymentId
 * @param {void} trx
 */
async function changePaymentProcessorValue(paymentId, trx) {
    await Payment.query(trx)
        .findById(paymentId)
        .patch({
            paymentProcessor: 'ESD',
        })
        .returning('*');
}

desc('Change paymentProcessor in Payment from cashCard to ESD');
task('change_paymentProcessor_for_cashCard_payment', async () => {
    let trx = null;
    try {
        const payments = await Payment.query().where({
            paymentProcessor: 'cashCard',
        });

        trx = await transaction.start(Payment.knex());

        const cashCardPaymentResult = payments.map((payment) =>
            changePaymentProcessorValue(payment.id, trx),
        );

        await Promise.all(cashCardPaymentResult);
        await JakeTasksLog.query(trx).insert({
            taskName: 'change_paymentProcessor_for_cashCard_payment',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
