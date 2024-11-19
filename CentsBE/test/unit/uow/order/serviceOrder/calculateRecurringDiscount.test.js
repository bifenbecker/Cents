require('../../../../testHelper');
const calculateRecurringDiscount = require('../../../../../uow/order/serviceOrder/calculateRecurringDiscount');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test Calculate recurring discount', () => {
    let payload;
    beforeEach(() => {
        payload = {
            serviceOrderRecurringSubscription: {
                recurringDiscountInPercent: 5.5,
            },
            orderItemsTotal: 50.45,
            promotionAmount: 10.22,
        };
    });

    it('should return recurring discount as 2.21', async () => {
        const result = await calculateRecurringDiscount(payload);
        expect(result).to.have.property('recurringDiscount').equal(2.21);
    });

    it('should return 0, if there is no service order recurring subscription', async () => {
        delete payload.serviceOrderRecurringSubscription;
        const result = await calculateRecurringDiscount(payload);
        expect(result).to.have.property('recurringDiscount').equal(0);
    });
});
