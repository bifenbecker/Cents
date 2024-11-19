const { task, desc, fail } = require('jake');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const JakeTasksLog = require('../models/jakeTasksLog');
const storeTheme = require('../models/storeTheme');

// Updates to all stores
// jake "Add_kin_theme_to_store"[91,66]
// NOTE: Please do not add speces in between parameters.
async function updateKinThemeToStores(storeIds) {
    const numberOfAffectedRows = await storeTheme
        .query()
        .patch({
            primaryColor: '#000000',
            secondaryColor: '#FFFFFF',
            borderRadius: '4px',
            logoUrl: 'https://cents-product-images.s3.us-east-2.amazonaws.com/Logo_Kin.svg',
        })
        .where('storeId', 'in', storeIds);
    LoggerHandler('info', `Number of rows affected:::::::${numberOfAffectedRows}`);
    return true;
}

desc('Run task to add kin theme based on storeIds');
task('Add_kin_theme_to_store', async (...storeIds) => {
    const stores = storeIds.filter((ele) => ele !== null && ele !== '');
    if (!stores || !stores.length) {
        LoggerHandler('error', 'Task aborted::::::::', { storeIds });
        fail('Task aborted due to insufficient storeIds:::::;');
    }
    LoggerHandler('info', 'Jake task started......');
    await updateKinThemeToStores(stores);
    await JakeTasksLog.query().insert({
        taskName: `Add_kin_theme_to_store ${storeIds}`,
    });
    LoggerHandler('info', 'Kin theme updated successfully to all stores...');
});
