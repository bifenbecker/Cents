const moment = require('moment');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const { sendDailyDigestEmail } = require('../services/email/dailyDigestEmail');

const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Send daily digest email job
 * @param {Object} job
 * @param {Object} done
 */
module.exports = async (job, done) => {
    try {
        LoggerHandler('info', 'Daily Digest Email job started::::::::::');

        const reportDate = moment().format(DATE_FORMAT);
        const yesterday = moment(reportDate).subtract(1, 'd').format(DATE_FORMAT);
        const result = await sendDailyDigestEmail(reportDate, yesterday);

        LoggerHandler('info', 'Daily Digest Email job completed::::::::::');
        done(null, result);
    } catch (err) {
        LoggerHandler('error', err, { job });
        done(err);

        throw err;
    }
};
