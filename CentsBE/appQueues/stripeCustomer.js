const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const stripeCustomerCreate = require('../utils/stripeCustomerCreate');

module.exports = async (job, done) => {
    try {
        const { name } = job;
        LoggerHandler('info', `${name} started....`);
        await stripeCustomerCreate();
        LoggerHandler('info', `${name} successfully completed....`);
        done();
    } catch (err) {
        LoggerHandler('error', err, { job });
        done(err);
    }
};
