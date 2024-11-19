require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');

const updateStoreCustomerBalanceUow = require('../../../../../uow/liveLink/customer/payment/updateStoreCustomerBalanceUow');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const CreditHistory = require('../../../../../models/creditHistory');
const { CREDIT_REASON_NAMES } = require('../../../../../constants/constants');

describe('updateStoreCustomerBalanceUow', function () {
    let centsCustomer;
    let business;
    let store;
    let storeCustomer;
    let creditReason;

    beforeEach(async function () {
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        creditReason = await factory.build(FACTORIES_NAMES.creditReason, {
            reason: CREDIT_REASON_NAMES.CUSTOMER_SERVICE,
            id: 1,
        });
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: business.id,
        });
    });

    it('should return paymentIntent and availableCredits equal to credits', async function () {
        const actual = await updateStoreCustomerBalanceUow({
            paymentIntent: {},
            credits: 14,
            storeCustomerId: storeCustomer.id,
            customerId: centsCustomer.id,
            businessId: storeCustomer.businessId,
        });

        expect(actual).to.deep.equal({
            paymentIntent: {},
            availableCredits: 14,
        });
    });

    it('should return paymentIntent and availableCredits equal to credits plus creditHistory when it is not empty', async function () {
        await CreditHistory.query().insert({
            customerId: centsCustomer.id,
            businessId: storeCustomer.businessId,
            reasonId: creditReason.id,
            amount: 20,
        });

        await CreditHistory.query().insert({
            customerId: centsCustomer.id,
            businessId: storeCustomer.businessId,
            reasonId: creditReason.id,
            amount: 0.5,
        });

        const actual = await updateStoreCustomerBalanceUow({
            paymentIntent: {},
            credits: 14,
            storeCustomerId: storeCustomer.id,
            customerId: centsCustomer.id,
            businessId: storeCustomer.businessId,
        });

        expect(actual).to.deep.equal({
            paymentIntent: {},
            availableCredits: 34.5,
        });
    });
});
