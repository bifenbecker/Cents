const { task, desc } = require('jake');
const JakeTasksLog = require('../models/jakeTasksLog');
const CentsCustomerAddress = require('../models/centsCustomerAddress');
const { centsCustomerAddressQueue } = require('../appQueues');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Add Lat and Lng to centsCustomerAddress');
task('add_lat_and_lng_to_centsCustomerAddress', async () => {
    try {
        const addressWithOutLatAndLng = await CentsCustomerAddress.query()
            .where('lat', null)
            .andWhere('lng', null)
            .returning('*');
        if (addressWithOutLatAndLng.length) {
            addressWithOutLatAndLng.forEach((customerAddress) => {
                centsCustomerAddressQueue.add('customer_address_created', { customerAddress });
            });
        }
        await JakeTasksLog.query().insert({
            taskName: 'add_lat_and_lng_to_centsCustomerAddress',
        });
    } catch (error) {
        LoggerHandler('error', 'error at add_lat_and_lng_to_centsCustomerAddress');
        LoggerHandler('error', error);
    }
});
