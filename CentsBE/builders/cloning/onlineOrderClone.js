const BaseServiceOrderClone = require('./baseServiceOrderClone');
const { origins, locationType } = require('../../constants/constants');
const PaymentMethod = require('../../models/paymentMethod');

class OnlineOrderClone extends BaseServiceOrderClone {
    async build() {
        await this.setServiceOrder();
        await this.setCustomerSelectedServiceOrderItems();
        await this.validateAddressAndTimings();
        await super.build();
        this.setCentsCustomer();
        this.addServicePriceId();
        this.addServiceModifierIds();
        this.addOrderNotes();
        this.addCustomerNotes();
        await this.addPaymentToken();
        this.addBagCount();
        // this.addPromoCode();

        if (this.pickupAddressServiceable) {
            this.addCustomerAddress();
            this.addPickup();
            if (this.returnable) {
                this.addDelivery();
            }
            this.addReturnMethod();
        }
        return this.payload;
    }

    async setCustomerSelectedServiceOrderItems() {
        this.customerSelectedServiceOrderItems = this.serviceOrder.customerOrderItems;
    }

    async validateAddressAndTimings() {
        this.pickupAddressServiceable = true;
        this.returnable = true;
    }

    addServicePriceId() {
        const priceId = this.customerSelectedServiceOrderItems
            .map((orderitem) =>
                orderitem.referenceItems.map((referenceItem) => referenceItem.servicePriceId),
            )
            .flat()
            .filter((x) => x)[0];
        this.payload.servicePriceId = priceId;
    }

    addServiceModifierIds() {
        const mdifierIds = this.customerSelectedServiceOrderItems
            .map((orderitem) =>
                orderitem.referenceItems.map((referenceItem) => referenceItem.serviceModifierId),
            )
            .flat()
            .filter((x) => x);
        this.payload.serviceModifierIds = mdifierIds;
    }

    async addPaymentToken() {
        const savedPaymentMethod = await PaymentMethod.query().findOne({
            paymentMethodToken: this.serviceOrder.paymentToken,
            centsCustomerId: this.centsCustomer.id,
        });
        if (savedPaymentMethod) {
            this.payload.paymentToken = this.serviceOrder.paymentToken;
        } else {
            this.payload.paymentToken = null;
        }
    }

    addPickup() {
        this.payload.orderDelivery = this.payload.orderDelivery || {};
        this.payload.orderDelivery.pickup = {
            type: 'PICKUP',
        };
    }

    addDelivery() {
        this.payload.orderDelivery.delivery = {
            type: 'RETURN',
        };
    }

    setCentsCustomer() {
        const { storeCustomer } = this.serviceOrder;
        this.centsCustomer = storeCustomer.centsCustomer;
    }

    addCustomerAddress() {
        const { pickup } = this.serviceOrder.order;
        if (pickup) {
            this.payload.address = pickup.centsCustomerAddress;
            this.payload.centsCustomerAddressId = pickup.centsCustomerAddressId;
        }
    }

    addOrderType() {
        this.payload.orderType = 'ONLINE';
    }

    addStatus() {
        this.payload.status = 'SUBMITTED';
    }

    addPaymentTiming() {
        this.payload.paymentTiming = 'POST-PAY';
    }

    addOrigin() {
        this.payload.origin = origins.LIVE_LINK;
    }

    addHubInfo() {
        const { isBagTrackingEnabled, type, hubId } = this.serviceOrder.store;
        this.payload.isProcessedAtHub = type === locationType.INTAKE_ONLY;
        this.payload.hubId = type === locationType.INTAKE_ONLY ? hubId : null;
        this.payload.isBagTrackingEnabled = isBagTrackingEnabled;
    }

    addBagCount() {
        this.payload.bagCount = this.serviceOrder.serviceOrderBags.length;
    }
}

module.exports = exports = OnlineOrderClone;
