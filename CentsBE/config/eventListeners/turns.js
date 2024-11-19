const eventEmitter = require('../eventEmitter');
const { checkTurnStatusQueue } = require('../../appQueues');
const { DURATIONS } = require('../../constants/constants');

eventEmitter.on('turnCreated', (payload) => {
    checkTurnStatusQueue.add('checkTurnStatusQueue', payload, { delay: DURATIONS.TURN_MAX_TIME });
});

module.exports = eventEmitter;
