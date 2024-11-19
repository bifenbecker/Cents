const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Turns = require('../models/turns');
const { turnStatuses } = require('../constants/constants');

async function checkTurnStatus(job, done) {
    try {
        const { turnId } = job.data;
        const turn = await Turns.query()
            .select('*')
            .where('id', turnId)
            .whereIn('status', [turnStatuses.CREATED, turnStatuses.STARTED, turnStatuses.RUNNING])
            .first();
        if (turn) {
            await Turns.query().patch({ status: turnStatuses.COMPLETED }).findById(turnId);
            // TODO: Update the device status based on offline data dump
        }
        LoggerHandler('info', 'Turn status checking job completed');
        done();
    } catch (err) {
        LoggerHandler('error', err, { job });
    }
}

module.exports = checkTurnStatus;
