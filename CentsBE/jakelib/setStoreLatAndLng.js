const { task, desc } = require('jake');
const JakeTasksLog = require('../models/jakeTasksLog');
const StoreSettings = require('../models/storeSettings');
const eventEmitter = require('../config/eventEmitter');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Add Lat and Lng to storeSettings');
task('set_store_lat_and_lng', async () => {
    try {
        const storeSettings = await StoreSettings.query()
            .where('lat', null)
            .andWhere('lng', null)
            .returning('*');
        if (storeSettings.length) {
            storeSettings.forEach((storeSetting) => {
                eventEmitter.emit('storeUpdated', storeSetting.storeId);
            });
        }
        await JakeTasksLog.query().insert({
            taskName: 'set_store_lat_and_lng',
        });
    } catch (error) {
        LoggerHandler('error', error);
    }
});
