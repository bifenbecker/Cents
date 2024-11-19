const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const updateMachineTurnsStats = require('../workers/machineTurnsStats/updateMachineTurnsStats');

module.exports = async (job, done) => {
    try {
        LoggerHandler('info', 'updating machines turns stats job started::::::');
        await updateMachineTurnsStats();
        LoggerHandler('info', 'updating machines turns stats job completed:::::::');
        done();
    } catch (error) {
        LoggerHandler('error', error, { job });
        done(error);
    }
};
