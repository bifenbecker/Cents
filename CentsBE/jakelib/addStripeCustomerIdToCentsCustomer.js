const { task, desc } = require('jake');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const { stripeCustomerQueue } = require('../appQueues');

desc('add stripeCustomerId to centsCustomer table.');

task('add_stripeCustomerId_to_centsCustomers', async () => {
    try {
        stripeCustomerQueue.add('stripeCustomerCreate', {});
        LoggerHandler('info', 'Stripe customer creation job initiated...');
        LoggerHandler('info', 'Please check arena interface for more details....');
    } catch (error) {
        LoggerHandler(
            'error',
            'Error occured while adding stripeCustomerId to centsCustomer table',
        );
        LoggerHandler('error', error);
    }
});
