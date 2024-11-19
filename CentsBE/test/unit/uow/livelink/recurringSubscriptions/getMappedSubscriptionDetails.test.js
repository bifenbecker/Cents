require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const getSubscriptionDetails = require('../../../../../uow/recurringSubscriptions/getMappedSubscriptionDetails');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    ORDER_TYPES,
    ORDER_DELIVERY_TYPES,
    scheduledJobStatuses,
    statuses
} = require('../../../../../constants/constants');

describe('test getSubscriptionDetails', () => {
    let serviceOrder, order, subscription, payload;

    beforeEach(async () => {
        subscription = await factory.create(FN.recurringSubscription);
        serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: ORDER_TYPES.ONLINE,
            status: statuses.READY_FOR_PROCESSING,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        serviceOrderRecurringSubscription = await factory.create(
            FN.serviceOrderRecurringSubscription,
            {
                recurringSubscriptionId: subscription.id,
                serviceOrderId: serviceOrder.id,
            },
        );
        orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            status: scheduledJobStatuses.SCHEDULED,
        });

        payload = {
            subscription
        };
    });
    it('should return payload', async () => {
        const res = await getSubscriptionDetails(payload);

        expect(res.mappedSubscription).to.have.length;
        expect(res.mappedSubscription.pickupTimingsId).to.equal(payload.subscription.pickupTimingsId);
        expect(res.mappedSubscription.pickupWindow).to.include(payload.subscription.pickupWindow[0]);
        expect(res.mappedSubscription.pickupWindow).to.include(payload.subscription.pickupWindow[1]);
        expect(res.mappedSubscription.returnWindow).to.have.length;
        expect(res.mappedSubscription.pickupTimingsId).to.equal(payload.subscription.pickupTimingsId);
        expect(res.mappedSubscription.returnTimingsId).to.have.length;
        expect(res.mappedSubscription.servicePriceId).to.equal(payload.subscription.servicePriceId);
        expect(res.mappedSubscription.modifierIds).to.have.length;
    });

    it('should throw error for passing invalid payload', async () => {
        try {
            await getSubscriptionDetails({ subscription: 1 });
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('Error: undefined was passed to findById');
        }
    });

    it('should throw error for not passing the payload', async () => {
        expect(getSubscriptionDetails({})).rejectedWith(Error);
    });
});
