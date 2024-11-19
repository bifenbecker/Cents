require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const manageCreditHistory = require('../../../../../../uow/order/serviceOrder/adjustOrder/manageCreditHistory');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const CreditHistory = require('../../../../../../models/creditHistory');

const createFactories = async (paymentTiming, balanceDue, orderTotal, netOrderTotal, creditAmount) => {
    const store = await factory.create(FN.store);
    const business = await factory.create(FN.laundromatBusiness);
    const centsCustomer = await factory.create(FN.centsCustomer);
    const storeCustomer = await factory.create(FN.storeCustomer, {
        centsCustomerId: centsCustomer.id,
        storeId: store.id,
        businessId: business.id,
    });
    const creditReason = await factory.create(FN.creditReason, {
        reason: 'Order Adjustment'
    });
    const creditHistory = await factory.create(FN.creditHistory, {
        businessId: business.id,
        customerId: centsCustomer.id,
        reasonId: creditReason.id
    });
    const serviceOrder = await factory.create(FN.serviceOrder, {
        storeId: store.id,
        storeCustomerId: storeCustomer.id,
        orderCode: '5004',
        balanceDue,
        orderTotal,
        netOrderTotal,
        paymentTiming,
        creditAmount,
        promotionAmount: 0,
        placedAt: '2020-05-07 16:20:.673073+00',
    });

    return {
        serviceOrder,
        centsCustomer,
        store
    }
};

describe('test manageCreditHistory UoW', () => {
    let payload;

    it('should manage if balanceDue is less than zero', async () => {
        const { serviceOrder, centsCustomer, store } = await createFactories('PRE-PAY', -1, -1, -1, 0);

        payload = {
            creditAmount: serviceOrder.creditAmount,
            orderTotal: serviceOrder.orderTotal,
            promotionAmount: serviceOrder.promotionAmount,
            balanceDue: serviceOrder.balanceDue,
            customer: {
                ...centsCustomer,
            },
            store,
            currentOrderDetails: {
                previousCreditAmount: serviceOrder.creditAmount
            },
        };

        await manageCreditHistory(payload);

        const creditHistory = await CreditHistory.query()
            .where({ customerId: centsCustomer.id })
            .first();

        expect(creditHistory).to.have.property('reasonId');
        expect(creditHistory).to.have.property('customerId');
        expect(creditHistory).to.have.property('amount').not.equals(serviceOrder.balanceDue);
        expect(creditHistory).to.have.property('businessId');
    });

    it('should NOT manage when previousCreditAmount is equal creditAmount and balanceDue is bigger than zero', async () => {
        const { serviceOrder, centsCustomer, store } = await createFactories('POST-PAY', 10, 10, 10, 0);

        payload = {
            creditAmount: serviceOrder.creditAmount,
            orderTotal: serviceOrder.orderTotal,
            promotionAmount: serviceOrder.promotionAmount,
            balanceDue: serviceOrder.balanceDue,
            customer: {
                ...centsCustomer,
            },
            store,
            currentOrderDetails: {
                previousCreditAmount: serviceOrder.creditAmount
            },
        };

        await manageCreditHistory(payload);

        const creditHistory = await CreditHistory.query()
            .where({ customerId: centsCustomer.id })
            .first();

        expect(creditHistory).to.have.property('reasonId');
        expect(creditHistory).to.have.property('customerId');
        expect(creditHistory).to.have.property('amount').equals(serviceOrder.balanceDue);
        expect(creditHistory).to.have.property('businessId');
    });

    it('should fail to update for not passing the payload', async () => {
        payload = {};
        expect(manageCreditHistory(payload)).rejectedWith(Error);
    });
});