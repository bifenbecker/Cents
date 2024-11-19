const { StoreSchema } = require('./schema');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

(() => {
    try {
        StoreSchema();
    } catch (error) {
        LoggerHandler('error', 'error in creating store index', error);
    }
})();
