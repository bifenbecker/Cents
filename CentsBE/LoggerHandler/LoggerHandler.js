/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const logger = require('../lib/logger');

/**
 * The LoggerHandler is a wrapper for the winston/morgan logging
 * This function can take in a req or payload object for logging as well
 * _removeSensitiveData will remove all defined sensitive keys from req.body
 *
 * @param {String} type expected values 'info', 'error', 'debug'
 * @param {String} msg
 * @param {Object} req default {}
 */

const LoggerHandler = (type, msg, req = {}) => {
    const sensitiveKeys = ['password', 'paymentInfo'];

    const _removeSensitiveData = () => {
        if ('body' in req) {
            const reqBodyKeys = Object.keys(req.body);

            sensitiveKeys.forEach((key) => {
                if (reqBodyKeys.includes(key)) req.body[key] = '*#REDACTED#*';
            });
        }
    };

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#examples
    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    };

    const handleDebug = (loggedMsg) => logger.debug(loggedMsg);
    const handleInfo = (loggedMsg) => logger.info(loggedMsg);
    const handleError = (loggedMsg) => logger.error(loggedMsg);

    const createMessage = () => {
        try {
            let loggedMsg = `\n${msg}\n`;

            let payload =
                'body' in req ? JSON.stringify(req.body, getCircularReplacer(), 2) : undefined;
            // If object sent over is a payload and not req object
            if (!payload && Object.keys(req).length) {
                payload = JSON.stringify(req, getCircularReplacer(), 2);
            }

            if (payload) {
                loggedMsg += `\n+++ 58: LoggerHandler/LoggerHandler.js - Payload:\n\n${payload}\n`;
            }

            return loggedMsg;
        } catch (e) {
            logger.error(
                ` +++ 64: Error creating logging message:\n\n${e}\n\n LoggerHandler/LoggerHandler.js - Payload:\n\n${{
                    type,
                    msg,
                    req,
                }}`,
            );
            return null;
        }
    };

    const handleLog = () => {
        const loggedMsg = createMessage();

        if (type === 'debug') return handleDebug(loggedMsg);
        if (type === 'info') return handleInfo(loggedMsg);
        if (type === 'error') return handleError(loggedMsg);

        return null;
    };

    _removeSensitiveData();
    return handleLog();
};

module.exports = LoggerHandler;
