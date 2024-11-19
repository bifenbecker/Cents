const Payment = require('../../lib/devices/handlers/Payment');
const Presence = require('../../lib/devices/handlers/Presence');
const ErrorHandler = require('../../lib/devices/handlers/Error');
const StatusChange = require('../../lib/devices/handlers/StatusChangeWithTurnCreation');

const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

class Operations {
    constructor(payload) {
        this.payload = JSON.parse(payload);
    }

    async perform() {
        const { type, ...rest } = this.payload;
        switch (type) {
            case 'CONNECTION_STATUS':
                await new Presence(rest).execute();
                break;
            case 'STATUS_CHANGE':
                await new StatusChange(rest).execute();
                break;
            case 'ERROR':
                await new ErrorHandler(rest).execute();
                break;
            case 'PAYMENT':
                await new Payment(rest).execute();
                break;
            default:
                LoggerHandler('info', type);
                break;
        }
    }
}

module.exports = Operations;
