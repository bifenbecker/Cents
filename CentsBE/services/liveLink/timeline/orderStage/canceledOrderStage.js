const BaseOrderStage = require('./baseOrderStage');

const { livelinkImageKeys } = require('../../../../constants/constants');

class CanceledOrderStage extends BaseOrderStage {
    getImageKey() {
        return livelinkImageKeys.ORDER_CANCELED;
    }

    getHeaderDetails() {
        return { name: 'Canceled', description: '' };
    }

    getFooterDetails() {
        return {
            name:
                this.serviceOrder.orderType === 'ONLINE'
                    ? 'Would you like to place another order?'
                    : '',
            description: '',
        };
    }
}

module.exports = CanceledOrderStage;
