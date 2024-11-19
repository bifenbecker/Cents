const numeral = require('numeral');
const moment = require('moment');
const { CURRENCY_FORMAT, DATE_FORMATS } = require('./constants');

const ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    DEBUG: 'debug',
};

const getEnvironment = () => process.env.NODE_ENV;

const isDevEnvironment = () => getEnvironment() === ENVIRONMENTS.DEVELOPMENT;

const isDebugEnvironment = () => getEnvironment() === ENVIRONMENTS.DEBUG;

// Returns currency format that we use across the application
const currency = (value, format = CURRENCY_FORMAT) => numeral(value).format(format);
const formatDateWithTimezone = (value, format = DATE_FORMATS.DAILY_DIGEST_EMAIL_DATE_FORMAT) =>
    moment.tz(value, DATE_FORMATS.BUSINESS_TIMEZONE).format(format);

exports.getEnvironment = getEnvironment;
exports.ENVIRONMENTS = ENVIRONMENTS;
exports.isDevEnvironment = isDevEnvironment;
exports.isDebugEnvironment = isDebugEnvironment;
exports.currency = currency;
exports.formatDateWithTimezone = formatDateWithTimezone;
