require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const cancelNextPickup = require('../../../../../uow/recurringSubscriptions/cancelNextPickup');

const factory = require('../../../../factories');

const RecurringSubscription = require('../../../../../models/recurringSubscription');

describe('test cancel next pickup uow', () => {
    let subscription,
        timeZone,
        serviceOrderRecurringSubscription,
        serviceOrder,
        order,
        orderDelivery;

    beforeEach(async () => {
        subscription = await factory.create('recurringSubscription');
        serviceOrder = await factory.create('serviceOrder', {
            orderType: 'ONLINE',
            status: 'READY_FOR_PROCESSING',
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        serviceOrderRecurringSubscription = await factory.create(
            'serviceOrderRecurringSubscription',
            {
                recurringSubscriptionId: subscription.id,
                serviceOrderId: serviceOrder.id,
            },
        );
        orderDelivery = await factory.create('orderDelivery', {
            orderId: order.id,
            type: 'PICKUP',
            status: 'SCHEDULED',
        });
        timeZone = 'America/Los_Angeles';
        day = 1;
    });

    it('should update recuring rule string', async () => {
        await cancelNextPickup({ id: subscription.id, subscription });
        const updatedSubscription = await RecurringSubscription.query().findById(subscription.id);
        subscription.cancelledPickupWindows = updatedSubscription.cancelledPickupWindows;
        expect(updatedSubscription.cancelledPickupWindows.length).to.be.equal(1);
    });

    it('should throw error when next pickup is already cancelled', async () => {
        try {
            const response = await cancelNextPickup({ id: subscription.id, subscription });
            await cancelNextPickup({ id: subscription.id, subscription: response.subscription });
        } catch (error) {
            expect(error.message).to.equal("Error: Sorry!! You can't cancel the next pickup");
        }
    });

    it('should throw error for not passing the payload', async () => {
        expect(cancelNextPickup({})).rejectedWith(Error);
    });
});
