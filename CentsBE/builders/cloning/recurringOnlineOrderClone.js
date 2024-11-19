const Timings = require('../../models/timings');

const GeneralDeliverySettingsService = require('../../services/deliverySettings/generalDeliverySettings');
const ServiceOrderQuery = require('../../services/queries/serviceOrder');
const OnlineOrderClone = require('./onlineOrderClone');

const {
    returnMethods,
    ORDER_DELIVERY_TYPES,
    deliveryProviders,
} = require('../../constants/constants');
const { SHIFT_TYPES } = require('../../lib/constants');

const { toDateWithTimezone, getUnixTimestamp } = require('../../helpers/dateFormatHelper');
const { findStoreById } = require('../../elasticsearch/store/queries');
const DoordashEstimateService = require('../../services/doordashEstimateService');

class RecurringOnlineOrderClone extends OnlineOrderClone {
    async build() {
        await this.setServiceOrder();
        this.setRecurringSubscription();
        await this.getOnDemandSettings();
        await this.validateAddressAndTimings();

        if (!this.addressServiceable) {
            throw new Error('Address is not seviceable anymore.');
        }

        this.addServicePriceId();
        this.addServiceModifierIds();
        this.addOrderNotes();
        this.addCustomerNotes();
        this.addPaymentToken();
        this.addBagCount();

        this.addCustomerAddressId();
        await this.addPickup();
        if (this.addressReturnable) {
            await this.addDelivery();
        }
        this.addReturnMethod();

        return this.payload;
    }

    async buildForPipeline() {
        await this.build();
        this.setCentsCustomer();
        this.addCentsCustomer();
        this.addBusinessCustomer();
        this.addCustomerAddress();
        this.addOrderItems();
        await this.addESStore();
        this.addSettings();
        this.addOrderType();
        this.addStatus();
        this.addBusinessId();
        this.addPaymentTiming();
        this.addOrigin();
        this.addHubInfo();
        this.addRecurringSubscription();
        this.addZipCode();
        return this.payload;
    }

    async addESStore() {
        this.payload.store = await findStoreById(this.serviceOrder.storeId);
    }

    setCentsCustomer() {
        const { storeCustomer } = this.serviceOrder;
        this.centsCustomer = storeCustomer.centsCustomer;
    }

    addBusinessCustomer() {
        this.payload.businessCustomer = this.serviceOrder.storeCustomer.businessCustomer;
    }

    async getOnDemandSettings() {
        const service = new GeneralDeliverySettingsService(this.payload.storeId);
        this.onDemandSettings = await service.centsDeliverySettings();
    }

    async validateAddressAndTimings() {
        this.addressServiceable = true;
        this.addressReturnable = !!this.recurringSubscription.returnTimingsId;
    }

    setRecurringSubscription() {
        this.recurringSubscription =
            this.serviceOrder.serviceOrderRecurringSubscription.recurringSubscription;
    }

    addRecurringSubscription() {
        this.payload.recurringSubscription = this.recurringSubscription;
        if (
            this.payload.orderDelivery.pickup &&
            this.payload.orderDelivery.pickup.deliveryWindow &&
            this.payload.orderDelivery.pickup.deliveryWindow.length
        ) {
            // Doing this so the ServiceOrderRecurringSubscription will be created with the latest window
            this.payload.recurringSubscription.pickupWindow =
                this.payload.orderDelivery.pickup.deliveryWindow;
        }
    }

    addServicePriceId() {
        this.payload.servicePriceId = this.recurringSubscription.servicePriceId;
    }

    addServiceModifierIds() {
        this.payload.serviceModifierIds = this.recurringSubscription.modifierIds || [];
    }

    addPaymentToken() {
        this.payload.paymentToken = this.recurringSubscription.paymentToken;
    }

    addCustomerAddressId() {
        this.payload.customerAddressId = this.recurringSubscription.centsCustomerAddressId;
    }

    addCustomerAddress() {
        const centsCustomerAddress = this.centsCustomer.addresses;
        this.payload.address = centsCustomerAddress.find(
            ({ id }) => this.recurringSubscription.centsCustomerAddressId === id,
        );
        this.payload.centsCustomerAddressId = this.recurringSubscription.centsCustomerAddressId;
    }

    addZipCode() {
        this.payload.zipCode = this.payload.address.postalCode;
    }

    addCentsCustomer() {
        this.payload = {
            ...this.payload,
            ...this.centsCustomer,
        };
        this.payload.centsCustomer = this.centsCustomer;
    }

    async addPickup() {
        this.payload.orderDelivery = this.payload.orderDelivery || {};
        const prevPickup = !this.serviceOrder.isCancelled
            ? this.serviceOrder.order.pickup
            : await this.cancelledPickup();
        const { shiftType } = await Timings.query()
            .select('shift.type as shiftType')
            .withGraphJoined('shift')
            .findById(this.recurringSubscription.pickupTimingsId);
        const deliveryProvider = this.getDeliveryProvider(shiftType);

        this.payload.orderDelivery.pickup = {
            type: ORDER_DELIVERY_TYPES.PICKUP,
            timingsId: this.recurringSubscription.pickupTimingsId,
            deliveryProvider,
            deliveryWindow: this.generateStartAndEndTimeWindow(
                this.recurringSubscription.pickupWindow,
            ),
            thirdPartyDeliveryId: null,
            courierTip: prevPickup ? prevPickup.courierTip : 0,
            subsidyInCents:
                deliveryProvider === deliveryProviders.DOORDASH
                    ? this.onDemandSettings.subsidyInCents || 0
                    : 0,
        };
    }

    async cancelledPickup() {
        const serviceOrderQuery = new ServiceOrderQuery(this.serviceOrder.id);
        return serviceOrderQuery.cancelledPickup();
    }

    async cancelledDelivery() {
        const serviceOrderQuery = new ServiceOrderQuery(this.serviceOrder.id);
        return serviceOrderQuery.cancelledDelivery();
    }

    async addDelivery() {
        this.payload.orderDelivery = this.payload.orderDelivery || {};
        const type = ORDER_DELIVERY_TYPES.RETURN;
        const prevDelivery = !this.serviceOrder.isCancelled
            ? this.serviceOrder.order.delivery
            : await this.cancelledDelivery();
        const { shiftType } = await Timings.query()
            .select('shift.type as shiftType')
            .withGraphJoined('shift')
            .findById(this.recurringSubscription.returnTimingsId);
        const deliveryWindow = this.generateStartAndEndTimeWindow(
            this.recurringSubscription.returnWindow,
            this.recurringSubscription.pickupWindow[0],
        );
        const deliveryProvider = this.getDeliveryProvider(shiftType);
        const isDoordash = deliveryProvider === deliveryProviders.DOORDASH;
        this.payload.orderDelivery.delivery = {
            type,
            timingsId: this.recurringSubscription.returnTimingsId,
            deliveryProvider,
            deliveryWindow,
            thirdPartyDeliveryId: null,
            courierTip: prevDelivery ? prevDelivery.courierTip : 0,
            subsidyInCents: isDoordash ? this.onDemandSettings.subsidyInCents || 0 : 0,
        };
        if (isDoordash) {
            const { addresses } = this.serviceOrder.storeCustomer.centsCustomer;
            const customerAddress = addresses.find(
                ({ id }) => id === this.payload.customerAddressId,
            );
            const { estimateFee } = await new DoordashEstimateService(
                this.payload.storeId,
                customerAddress,
                this.serviceOrder.netOrderTotal,
                deliveryWindow,
                type,
            ).estimate();
            this.payload.orderDelivery.delivery.thirdPartyDeliveryCostInCents = estimateFee || 0;
        }
    }

    addReturnMethod() {
        this.payload.returnMethod = this.addressReturnable
            ? returnMethods.DELIVERY
            : returnMethods.IN_STORE_PICKUP;
    }

    getDeliveryProvider(shiftType) {
        return shiftType === SHIFT_TYPES.CENTS_DELIVERY
            ? deliveryProviders.DOORDASH
            : deliveryProviders.OWN_DRIVER;
    }

    generateStartAndEndTimeWindow(window, fromStartUnixTime) {
        const [startTime, endTime] = window;
        const { timeZone } = this.serviceOrder.store.settings;
        let tomorrowDate = toDateWithTimezone(new Date(), timeZone).add(1, 'd').startOf('day');
        const momentStartTime = getUnixTimestamp(Number(startTime) / 1000, timeZone);
        const momentEndTime = getUnixTimestamp(Number(endTime) / 1000, timeZone);
        if (fromStartUnixTime) {
            const fromStartUnixTimeMoment = getUnixTimestamp(
                Number(fromStartUnixTime) / 1000,
                timeZone,
            );
            const diff = momentStartTime.diff(fromStartUnixTimeMoment, 'days');
            if (diff) {
                tomorrowDate = tomorrowDate.add(diff, 'd');
            } else {
                // adding 1 day if the time diff between pickup and delivery is less than 24 hrs
                // for ex: pickup - 13/02/2022 10 AM - 2 PM
                // delivery - 14/02/2022 9 AM - 1 PM
                // in this case the diff gives zero days when the pickup and delivery time difference is less than 24hrs. so to avoid this we are adding 1 day in case of fetching window for return delivery
                tomorrowDate = tomorrowDate.add(1, 'd');
            }
        }
        return [
            tomorrowDate
                .set({
                    hour: momentStartTime.hours(),
                    minutes: momentStartTime.minutes(),
                })
                .valueOf(),
            tomorrowDate
                .set({
                    hour: momentEndTime.hours(),
                    minutes: momentEndTime.minutes(),
                })
                .valueOf(),
        ];
    }
}

module.exports = exports = RecurringOnlineOrderClone;
