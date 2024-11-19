/* eslint-disable consistent-return */
const { verifyRequest } = require('./authentication');
const clientStrategy = require('../middlewares/socketTokenAuth');
const userStores = require('../utils/userLocations');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

// eslint-disable-next-line no-unused-vars
const getContext = (payload) => {
    const context = {};
    return context;
};

const createHandlerFactory = (controller) => (socket) => async (body) => {
    const context = getContext(body);
    try {
        const verifiedBody = await verifyRequest(body);
        if (verifiedBody) {
            return controller(socket, context, verifiedBody);
        }
    } catch (error) {
        LoggerHandler('error', `Failed to verify request. Bad request format:\n\n${error}`);
    }
};

const clientFactoryHandler = (controller) => (socket) => async (body) => {
    const context = getContext(body);
    try {
        const { token } = socket.handshake.query;
        // storeId will be in payload.payload.
        const user = await clientStrategy(token);
        if (user) {
            // const decodedBody = jwt.decode(body); -> UI request won't be signed.
            const stores = await userStores(user);
            if (stores.length) {
                return controller(socket, context, stores);
            }
        }
    } catch (error) {
        LoggerHandler('error', `Failed to verify client request. Bad request format:\n\n${error}`);
    }
};

module.exports.createHandlerFactory = createHandlerFactory;
module.exports.clientFactoryHandler = clientFactoryHandler;
