const jwt = require('jsonwebtoken');
const pusher = require('./client');
const { checkUserStore } = require('../services/user/queries');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

class PusherOperations {
    constructor(socketId, channel, authtoken, source) {
        this.socketId = socketId;
        this.channel = channel;
        this.authtoken = authtoken;
        this.source = source;
    }

    async authenticate() {
        if (this.source === 'BUSINESS_MANAGER') {
            await this.validateBusinessManager();
        } else {
            this.validateEmployeeApp();
        }
        const auth = pusher.authenticate(this.socketId, this.channel);
        return auth;
    }

    static async publish(channelName, message, event = 'device-status-updated') {
        await pusher.trigger(channelName, event, JSON.stringify(message));
    }

    static async publishStoreEvent(storeId, message, event = 'device-status-updated') {
        try {
            await pusher.trigger(`private-store-${storeId}`, event, JSON.stringify(message));
        } catch (err) {
            LoggerHandler('error', `Failed event ${event} to store ${storeId}:\n\n${err}`);
        }
    }

    get storeId() {
        const splittedChannel = this.channel.split('-');
        const id = splittedChannel[splittedChannel.length - 1];
        if (!id || !Number(id)) {
            throw new Error('STORE_ID_MISSING');
        }
        return id;
    }

    async validateBusinessManager() {
        const decodedToken = jwt.verify(this.authtoken, process.env.JWT_SECRET_TOKEN);
        await checkUserStore(decodedToken.id, this.storeId);
    }

    validateEmployeeApp() {
        const decodedToken = jwt.verify(this.authtoken, process.env.JWT_SECRET_TOKEN);
        const { id } = decodedToken;
        if (id !== this.storeId) {
            throw new Error('STORE_NOT_MATCHING_TOPIC');
        }
    }
}

module.exports = PusherOperations;
