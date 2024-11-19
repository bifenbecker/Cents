const PusherOperations = require('../../pusher/PusherOperations');

async function authenticate(req, res, next) {
    try {
        const {
            body: { socket_id: socketId, channel_name: channelName },
            headers: { authtoken, source },
        } = req;
        if (!authtoken) {
            res.status(403).json({
                error: 'authtoken is required',
            });
            return;
        }
        if (!source || !['BUSINESS_MANAGER', 'EMPLOYEE_APP'].includes(source)) {
            res.status(403).json({
                error: 'source is required.',
            });
            return;
        }
        const pusherOperations = new PusherOperations(socketId, channelName, authtoken, source);
        const auth = await pusherOperations.authenticate();
        res.send(auth);
    } catch (error) {
        if (
            error.name === 'JsonWebTokenError' ||
            [
                'STORE_ID_MISSING',
                'STORE_ID_MISSING',
                'STORE_NOT_MATCHING_TOPIC',
                'USER_NOT_FOUND',
                'INVALID_STORE',
            ].includes(error.message)
        ) {
            res.status(403).send({ error: 'Unauthorized' });
            return;
        }
        next(error);
    }
}

module.exports = exports = authenticate;
