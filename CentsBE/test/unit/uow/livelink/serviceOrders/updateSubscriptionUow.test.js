require('../../../../testHelper');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');

const StoreSettings = require('../../../../../models/storeSettings');
const RecurringSubscription = require('../../../../../models/recurringSubscription');
const RRuleService = require('../../../../../services/rruleService');

const updateSubscriptionUow = require('../../../../../uow/liveLink/serviceOrders/updateSubscriptionUow');

describe('test updateSubscriptionUow', () => {
    let store, shift, storeSettings, subscription, pickupTiming, servicePrice, payload;
    beforeEach(async () => {
        store = await factory.create('store');
        shift = await factory.create('shift', { storeId: store.id });
        storeSettings = await StoreSettings.query().findOne({ storeId: store.id });
        subscription = await factory.create('recurringSubscription', { storeId: store.id });
        pickupTiming = await factory.create('timing', { shiftId: shift.id, day: '3' });
        servicePrice = await factory.create('servicePrice', { storeId: store.id });
        payload = {
            subscription: {
                id: subscription.id,
                pickupWindow: ['1631050000000', '1631070000000'],
                returnWindow: [],
                pickupTimingsId: pickupTiming.id,
                deliveryTimingsId: null,
                servicePriceId: servicePrice.id,
                paymentToken: 'test_token',
                modifierIds: [],
                interval: 2,
                weekday: 3,
            },
            storeSettings,
        };
    });
    it('should update subscription object', async () => {
        await updateSubscriptionUow(payload);
        const updatedSubscription = await RecurringSubscription.query().findById(subscription.id);
        const rruleObject = new RRuleService(updatedSubscription, storeSettings.timeZone);

        expect(rruleObject.getInterval).to.equal(payload.subscription.interval);
        expect(updatedSubscription.pickupWindow).to.include(payload.subscription.pickupWindow[0]);
        expect(updatedSubscription.pickupWindow).to.include(payload.subscription.pickupWindow[1]);
        expect(updatedSubscription.returnWindow).to.not.have.length;
        expect(updatedSubscription.pickupTimingsId).to.equal(pickupTiming.id);
        expect(updatedSubscription.returnTimingsId).to.be.null;
        expect(updatedSubscription.servicePriceId).to.equal(servicePrice.id);
        expect(updatedSubscription.modifierIds).to.not.have.length;
        expect(updatedSubscription.paymentToken).to.equal(payload.subscription.paymentToken);
    });

    it('should return newPickupWindow if subscription\'s pickup window updated', async () => {
        const { newPickupWindow } = await updateSubscriptionUow(payload);

        expect(newPickupWindow).to.include(payload.subscription.pickupWindow[0]);
        expect(newPickupWindow).to.include(payload.subscription.pickupWindow[1]);
    });

    it('should return no newPickupWindow if subscription\'s pickup is not updated', async () => {
        payload.subscription.pickupTimingsId = subscription.pickupTimingsId
        payload.subscription.pickupWindow = subscription.pickupWindow
        const { newPickupWindow } = await updateSubscriptionUow(payload);

        expect(newPickupWindow).to.be.null;
    });
});
