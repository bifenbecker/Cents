const { createLogger, transports, format } = require('winston');
const { isDevEnvironment, getEnvironment } = require('./helpers');

const logger = createLogger({
    level: isDevEnvironment() ? 'debug' : 'info',
    format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`),
    ),
    defaultMeta: { service: 'CentsBE', env: getEnvironment() },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`,
        // - format.printf is human readable while format.json is machine readable.
        new transports.File({ filename: 'error.log', level: 'error', format: format.json() }),
        new transports.File({ filename: 'combined.log', format: format.json() }),
        new transports.Console(),
    ],
});

module.exports = logger;
