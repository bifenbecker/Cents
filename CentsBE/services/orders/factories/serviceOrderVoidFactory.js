const ResidentialServiceOrderVoidHandler = require('../handlers/void/residentialServiceOrderVoidHandler');
const PostPayServiceOrderVoidHandler = require('../handlers/void/postPayServiceOrderVoidHandler');
const PrePayServiceOrderVoidHandler = require('../handlers/void/prePayServiceOrderVoidHandler');
const OnlineServiceOrderVoidHandler = require('../handlers/void/onlineServiceOrderVoidHandler');

class ServiceOrderVoidFactory {
    constructor(serviceOrder, metaData, transaction) {
        this.serviceOrder = serviceOrder;
        this.transaction = transaction;
        this.metaData = metaData || {};
    }

    handler() {
        switch (this.serviceOrder.orderType.toLowerCase()) {
            case 'service':
                return this.serviceOrder.paymentTiming === 'PRE-PAY'
                    ? this.prePayServiceOrderVoidHandler
                    : this.postPayServiceOrderVoidHandler;
            case 'residential':
                return new ResidentialServiceOrderVoidHandler(
                    this.serviceOrder,
                    this.metaData,
                    this.transaction,
                );
            default:
                // return online order
                return new OnlineServiceOrderVoidHandler(
                    this.serviceOrder,
                    this.metaData,
                    this.transaction,
                );
        }
    }

    get postPayServiceOrderVoidHandler() {
        return new PostPayServiceOrderVoidHandler(
            this.serviceOrder,
            this.metaData,
            this.transaction,
        );
    }

    get prePayServiceOrderVoidHandler() {
        return new PrePayServiceOrderVoidHandler(
            this.serviceOrder,
            this.metaData,
            this.transaction,
        );
    }
}
module.exports = exports = ServiceOrderVoidFactory;
