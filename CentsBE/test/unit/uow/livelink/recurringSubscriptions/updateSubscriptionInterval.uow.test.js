require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const updateSubscriptionInterval = require('../../../../../uow/recurringSubscriptions/updateSubscriptionInterval');

const factory = require('../../../../factories');

const RecurringSubscription = require('../../../../../models/recurringSubscription');

describe('test editing subscription interval uow', () => {
    let interval, weekday;
    it('should update recuring rule string', async () => {
        let subscription = await factory.create('recurringSubscription');
        interval = 3;
        await updateSubscriptionInterval({ interval, id: subscription.id, subscription });

        const updatedSubscription = await RecurringSubscription.query().findById(subscription.id);

        expect(updatedSubscription.recurringRule.split('\n')[1]).to.equal(
            `RRULE:FREQ=WEEKLY;BYDAY=WE;INTERVAL=${interval}`,
        );
    });

    it('should throw error for passing invalid interval value', async () => {
        try {
            let subscription = await factory.create('recurringSubscription');
            interval = -1;
            await updateSubscriptionInterval({ interval, id: subscription.id, subscription });
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('Error: Either interval or weekday is invalid');
        }
    });

    it('should throw error for not passing the payload', async () => {
        expect(updateSubscriptionInterval({})).rejectedWith(Error);
    });
});
