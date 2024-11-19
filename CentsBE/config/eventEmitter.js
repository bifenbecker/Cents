const EventEmitter = require('events');

EventEmitter.captureRejections = true;

class CentsEventEmitter extends EventEmitter {}

module.exports = new CentsEventEmitter();
