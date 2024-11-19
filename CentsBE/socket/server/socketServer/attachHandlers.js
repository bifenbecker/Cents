const { namespaces } = require('../namespaces');
const machineHandlers = require('../../../controllers/socket/machine');
const clientHandlers = require('../../../controllers/socket/client');

const attachHandlers = () => {
    namespaces.machine.on('connection', (socket) => {
        Object.entries(machineHandlers).forEach(([event, handlerFactory]) => {
            socket.on(event, handlerFactory(socket));
        });
    });
    namespaces.ui.on('connection', (socket) => {
        Object.entries(clientHandlers).forEach(([event, handlerFactory]) => {
            socket.on(event, handlerFactory(socket));
        });
    });
};

module.exports = attachHandlers;
