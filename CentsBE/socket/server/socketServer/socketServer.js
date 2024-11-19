const io = require('./bareBonesServer');
const attachHandlers = require('./attachHandlers');

attachHandlers();

module.exports = io;
