const socketIO = require('socket.io');
const httpServer = require('../httpServer');

const io = socketIO(httpServer);

module.exports = io;
