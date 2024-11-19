const BaseVoidHandler = require('./baseHandler');

class PrePayServiceOrderVoidHandler extends BaseVoidHandler {
    get refundableAmount() {
        return (
            this.serviceOrder.netOrderTotal +
            this.serviceOrder.creditAmount -
            this.serviceOrder.balanceDue
        );
    }
}

module.exports = exports = PrePayServiceOrderVoidHandler;
