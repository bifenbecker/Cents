const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const uploadCustomerRows = require('../uow/superAdmin/customers/uploadCustomerRowsUow');

module.exports = async (job, done) => {
    try {
        LoggerHandler('info', 'task for customer uploads started::::::');
        await uploadCustomerRows(job.data);
        LoggerHandler('info', 'task for customer uploads completed::::::');
        done();
    } catch (error) {
        LoggerHandler('error', error, { job });
        done(error);
    }
};
