const eventEmitter = require('../eventEmitter');
const { downloadReportQueue } = require('../../appQueues');

eventEmitter.on('downloadReport', (payload) => {
    downloadReportQueue.add('downloadReportQueue', payload);
});

module.exports = eventEmitter;
