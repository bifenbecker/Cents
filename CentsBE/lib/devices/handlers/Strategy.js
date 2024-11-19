const Base = require('../../../services/base');
const PusherOperations = require('../../../pusher/PusherOperations');

class Strategy extends Base {
    constructor(payload) {
        super();
        this.payload = payload;
    }

    async execute() {
        try {
            this.typeValidations();
            await this.startTransaction();
            const [resp, store] = await this.perform();
            await this.commitTransaction();
            if (resp && store) {
                await PusherOperations.publishStoreEvent(store, resp);
            }
        } catch (err) {
            if (this.transaction) {
                await this.rollbackTransaction();
            }
            throw err;
        }
    }

    typeValidations() {
        throw new Error('NOT_IMPLEMENTED');
    }
}

module.exports = Strategy;
