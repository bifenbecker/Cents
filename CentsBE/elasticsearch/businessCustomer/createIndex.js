const { businessCustomerSchema } = require('./schema');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

(() => {
    try {
        businessCustomerSchema();
    } catch (error) {
        LoggerHandler('error', 'error in creating busines customers index', error);
    }
})();
