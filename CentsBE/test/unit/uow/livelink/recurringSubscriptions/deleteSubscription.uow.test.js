require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');

const deleteSubscription = require('../../../../../uow/recurringSubscriptions/deleteSubscription');

const factory = require('../../../../factories');

const RecurringSubscription = require('../../../../../models/recurringSubscription');

describe('test deleting subscription uow', () => {
    it('should update deletedAt', async () => {
        let subscription = await factory.create('recurringSubscription');
        await deleteSubscription({ id: subscription.id });
        subscription = await RecurringSubscription.query().findById(subscription.id);
        expect(subscription.deletedAt).to.be.not.null;
    });

    it('should throw error for not passing the payload', async () => {
        expect(deleteSubscription({})).rejectedWith(Error);
    });
});
