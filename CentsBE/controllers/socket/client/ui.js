const { clientFactoryHandler } = require('../../../lib/createHandlerFactory');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

// Open a room (channel) for the ui namespace with the given storeId.
const open = clientFactoryHandler((socket, ctx, payload) => {
    let response;
    payload.forEach((storeId) => {
        socket.join(storeId, () => {
            try {
                response = {
                    storeId,
                    requestType: 'open',
                };
                LoggerHandler('info', 'Open received from User for storeId', storeId);
            } catch (error) {
                LoggerHandler('error', error);
            }
            socket.emit('acknowledgement', response); //  Not sure about signing the ui response.
        });
    });
});

module.exports = exports = { open };
