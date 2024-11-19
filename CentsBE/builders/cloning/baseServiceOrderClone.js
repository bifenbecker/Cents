const ServiceOrder = require('../../models/serviceOrders');

class BaseServiceOrderClone {
    constructor(serviceOrderId) {
        this.serviceOrderId = serviceOrderId;
        this.payload = {};
    }

    async build() {
        await this.setServiceOrder();
        return this.payload;
    }

    async setServiceOrder() {
        if (!this.serviceOrder) {
            const tablesToBeJoined = [
                'serviceOrderBags',
                'store.[settings]',
                'order.[allPickup as pickup.[centsCustomerAddress], delivery]',
                'storeCustomer.[centsCustomer.[addresses], businessCustomer]',
                'serviceOrderRecurringSubscription.[recurringSubscription]',
                'orderItems.[referenceItems.[lineItemDetail, modifiers]]',
                'customerOrderItems.[allReferenceItems as referenceItems.[allLineItemDetail as lineItemDetail, modifiers]]',
            ];
            this.serviceOrder = await ServiceOrder.query()
                .withGraphFetched(`[${tablesToBeJoined.join(', ')}]`)
                .findById(this.serviceOrderId);
            this.addStoreId();
        }
    }

    addCustomerNotes() {
        this.payload.customerNotes = this.serviceOrder.storeCustomer.notes;
    }

    addOrderNotes() {
        this.payload.orderNotes = this.serviceOrder.notes;
    }

    addOrderItems() {
        this.payload.orderItems = [];
    }

    addStoreId() {
        this.payload.storeId = this.serviceOrder.storeId;
    }

    addBusinessId() {
        this.payload.businessId = this.serviceOrder.store.businessId;
    }

    addReturnMethod() {
        this.payload.returnMethod = this.serviceOrder.returnMethod;
    }

    addStore() {
        this.payload.store = this.serviceOrder.store;
    }

    addSettings() {
        this.payload.settings = this.serviceOrder.store.settings;
    }
}

module.exports = exports = BaseServiceOrderClone;
