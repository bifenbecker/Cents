const mongoose = require('mongoose');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

let connectionString = process.env.MONGODB_URL;

exports.connect = async (connectionStringOverride) => {
    try {
        if (connectionStringOverride) {
            connectionString = connectionStringOverride;
        }
        LoggerHandler('debug', 'Attempting to connect to database');
        await mongoose.connect(
            connectionString,
            { useNewUrlParser: true },
            30000,
        ); /** mongodb://localhost:27017/cents-poc'/ */
        LoggerHandler('info', 'Successfully connected to database');
    } catch (error) {
        LoggerHandler('error', `Failed to connect to database:\n\n${error}`);
    }
};
