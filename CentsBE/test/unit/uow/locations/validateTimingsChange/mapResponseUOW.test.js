require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');

const mapResponseUOW = require('../../../../../uow/locations/validateTimingsChange/mapResponseUOW');

describe('test mapResponseUOW', async () => {
    it('should remove timings with no order deliveries or subscriptions and convert counts to integer', async () => {
        response = await mapResponseUOW({
            timingsWithDeliveriesAndSubscriptionsCount: [
                {
                    id: 1,
                    activeOrderDeliveriesCount: '0',
                    activeRecurringSubscriptionCount: '0',
                },
                {
                    id: 2,
                    activeOrderDeliveriesCount: '121',
                    activeRecurringSubscriptionCount: '631',
                },
                {
                    id: 3,
                    activeOrderDeliveriesCount: '0',
                    activeRecurringSubscriptionCount: '631',
                },
            ],
        });

        const counts = response.timingsWithDeliveriesAndSubscriptionsCount;
        const first = counts.find((t) => t.id === 1);
        const second = counts.find((t) => t.id === 2);
        const third = counts.find((t) => t.id === 3);

        expect(first).to.be.undefined;

        expect(second).to.not.be.undefined;
        expect(second.activeOrderDeliveriesCount).to.equal(121);
        expect(second.activeRecurringSubscriptionCount).to.equal(631);

        expect(third).to.not.be.undefined;
        expect(third.activeOrderDeliveriesCount).to.equal(0);
        expect(third.activeRecurringSubscriptionCount).to.equal(631);
    });
});
