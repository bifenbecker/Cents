const { fetchAndReindexBusinessCustomers } = require('./queries');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

(async () => {
    try {
        await fetchAndReindexBusinessCustomers();
        process.exit(0);
    } catch (error) {
        LoggerHandler('error', 'error in reindexing busines customers', error);
    }
})();
