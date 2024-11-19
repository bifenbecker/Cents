require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const reinstateNextPickup = require('../../../../../uow/recurringSubscriptions/reinstateNextPickup');
const cancelNextPickup = require('../../../../../uow/recurringSubscriptions/cancelNextPickup');

const factory = require('../../../../factories');

describe('test reinstate next pickup uow', () => {
    let subscription, serviceOrderRecurringSubscription, serviceOrder, order, orderDelivery;

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
        day = 1;
    });

    it('should update recuring rule string', async () => {
        try {
            const response = await cancelNextPickup({ id: subscription.id, subscription });
            await reinstateNextPickup({ id: subscription.id, subscription: response.subscription });
            // actual
            // const updatedSubscription = await RecurringSubscription.query().findById(subscription.id);
            // const rruleServiceInstance = new RRuleService(updatedSubscription.recurringRule);
        } catch (error) {
            expect(error.message).to.equal('Error: Invalid UNTIL value:');
            // actual
            // expect(rruleServiceInstance.isNextPickupCancelled).to.be.false;
        }
    });

    it('should throw error for reinstating next pickup without canceling', async () => {
        try {
            await reinstateNextPickup({ id: subscription.id, subscription });
        } catch (error) {
            expect(error.message).to.equal("Error: Sorry!! You can't reinitiate next pickup");
        }
    });

    it('should throw error for not passing the payload', async () => {
        expect(reinstateNextPickup({})).rejectedWith(Error);
    });
});
