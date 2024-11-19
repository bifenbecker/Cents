const BaseService = require('../../base');
const ServiceOrderVoidFactory = require('../factories/serviceOrderVoidFactory');
const isOrderCanBeCanceled = require('../../../utils/isOrderCanBeCanceled');
const StoreCustomer = require('../../../models/storeCustomer');
const getServiceOrder = require('./queries/getServiceOrder');

class VoidServiceOrder extends BaseService {
    constructor(serviceOrderId, metaData) {
        super();
        this.serviceOrderId = serviceOrderId;
        this.metaData = metaData || {};
    }

    async perform() {
        this.serviceOrder = await getServiceOrder(this.serviceOrderId, this.transaction);
        if (!this.serviceOrder) {
            throw new Error('Order not found');
        }
        const customer = await StoreCustomer.query(this.transaction)
            .select('centsCustomerId')
            .findById(this.serviceOrder.storeCustomerId)
            .first();
        this.metaData.customerId = customer.centsCustomerId;
        // validate the order existence and if it can be voided
        await this.validate();
        return new ServiceOrderVoidFactory(this.serviceOrder, this.metaData, this.transaction)
            .handler()
            .handle();
    }

    async validate() {
        const canCancel = isOrderCanBeCanceled(
            this.serviceOrder,
            this.metaData.requestedFromLiveLink,
        );
        if (!canCancel) {
            throw new Error('Order can not be voided');
        }
    }
}
module.exports = exports = VoidServiceOrder;
