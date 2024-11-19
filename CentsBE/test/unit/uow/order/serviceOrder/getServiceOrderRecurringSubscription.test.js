require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const getServiceOrderRecurringSubscription = require('../../../../../uow/order/serviceOrder/getServiceOrderRecurringSubscription');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test Fetch service order recurring subscription', () => {
    let payload, serviceOrderRecurringSubscription, recurringSubscription;
    beforeEach(async () => {
        recurringSubscription = await factory.create(FN.recurringSubscription);
        serviceOrderRecurringSubscription = await factory.create(
            FN.serviceOrderRecurringSubscription,
            {
                recurringSubscriptionId: recurringSubscription.id,
            },
        );
        payload = {
            serviceOrderId: serviceOrderRecurringSubscription.serviceOrderId,
        };
    });

    it('should fetch service order recurring subscription joined with recurring subscription', async () => {
        const result = await getServiceOrderRecurringSubscription(payload);
        expect(result.serviceOrderRecurringSubscription).to.have.property(
            'recurringDiscountInPercent',
        );
        expect(result.serviceOrderRecurringSubscription).to.have.property('servicePriceId');
        expect(result.serviceOrderRecurringSubscription).to.have.property('modifierIds');
        expect(result.serviceOrderRecurringSubscription).to.have.property('serviceOrderId');
        expect(result.serviceOrderRecurringSubscription).to.have.property(
            'recurringSubscriptionId',
        );
        expect(result.serviceOrderRecurringSubscription).to.have.property('recurringSubscription');
        expect(result).to.have.property('subscription');
    });

    it('should return null, if there is no service order recurring subscription', async () => {
        payload.serviceOrderId = 1111;
        const result = await getServiceOrderRecurringSubscription(payload);
        expect(result.serviceOrderRecurringSubscription).equal(null);
        expect(result.subscription).equal(null);
    });

    it('should return empty result, if serviceOrderId is absent', async () => {
        payload = {};
        const result = await getServiceOrderRecurringSubscription(payload);

        expect(result).to.be.empty;
    });
});
