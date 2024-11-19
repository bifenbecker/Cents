require('../../../../testHelper');
const CreditHistory = require('../../../../../models/creditHistory');
const updateCreditHistory = require('../../../../../uow/order/serviceOrder/updateCreditHistory');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test updateCreditHistory UOW', () => {
    let store, payload;

    beforeEach(async () => {
        store = await factory.create('store');

        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        const creditHistory = await factory.create('creditHistory', {
            businessId: store.businessId,
            customerId: centsCustomer.id,
        });
        payload = {
            store,
            customer: {
                ...centsCustomer,
            },
        };
    });

    it('should be able to create a updateCreditHistory for service order if there is credit available', async () => {
        payload.creditAmount = 5;
        const result = await updateCreditHistory(payload);
        const totalCredit = await CreditHistory.query()
            .where('customerId', payload.customer.id)
            .sum('amount');
        expect(totalCredit[0].sum).to.equal(5);
    });

    it('should not update the creditHistory when creditAmount is not sent', async () => {
        const result = await updateCreditHistory(payload);
        const totalCredit = await CreditHistory.query()
            .where('customerId', payload.customer.id)
            .sum('amount');
        expect(totalCredit[0].sum).to.equal(10);
    });

    it('should not update the creditHistory when creditAmount sent is greater than the available sum', async () => {
        payload.creditAmount = 20;
        const result = await updateCreditHistory(payload);
        const totalCredit = await CreditHistory.query()
            .where('customerId', payload.customer.id)
            .sum('amount');
        expect(totalCredit[0].sum).to.equal(10);
    });
});
