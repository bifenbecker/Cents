const sinon = require('sinon');
require('../../../../testHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('chai');
const logger = require('../../../../../lib/logger');

const apiEndPoint = '/api/v1/employee-tab/home/orders/calculate-total';
const awaitPostError = async (token , body, expectedError) => {
    await assertPostResponseError({ 
        url: apiEndPoint,
        token,
        body,
        code: 422,
        expectedError,
    });
}

describe('test orderCalculations validation', () => {
    let store, token, centsCustomer, storeCustomer;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create(FN.centsCustomer);
        storeCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => apiEndPoint,
    );

    it('should fail when storeId is not passed', async () => {
        const spy = sinon.spy(logger, "error");
        await awaitPostError(token, {}, '"storeId" is required');
        expect(spy.called).to.be.true;
    });

    it('should fail when centsCustomerId is not passed', async () => {
        const spy = sinon.spy(logger, "error");
        await awaitPostError(token, {
            storeId: store.id,
        }, '"centsCustomerId" is required');
        expect(spy.called).to.be.true;
    });

    it('should fail when orderItems are not passed', async () => {
        await assertPostResponseError({ 
            url: apiEndPoint,
            token,
            body: {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
            },
            code: 500,
        });
    });


    it('should fail if centsCustomerId is invalid', async () => {
        await awaitPostError(token, {
            storeId: store.id,
            centsCustomerId: 0,
            orderItems: [],
        }, 'Invalid customer id');
    });


    it(`should fail if orderItems doesn't have priceId`, async () => {
        const spy = sinon.spy(logger, "error");
        await awaitPostError(token, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            orderItems: [{}],
        });
        expect(spy.called).to.be.true;
    });


    it(`should fail if orderItems doesn't have lineItemType`, async () => {
        const spy = sinon.spy(logger, "error");
        await awaitPostError(token, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            orderItems: [{
                priceId: 1,
            }],
        });
        expect(spy.called).to.be.true;
    });

    it(`should fail if orderItems doesn't have category`, async () => {
        const spy = sinon.spy(logger, "error");
        await awaitPostError(token, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            orderItems: [{
                priceId: 1,
                lineItemType: 'INVENTORY',
            }],
        });
        expect(spy.called).to.be.true;
    });

    it(`should fail if orderItems has orderItemId but it is not a number`, async () => {
        const spy = sinon.spy(logger, "error");
        await awaitPostError(token, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            orderItems: [{
                priceId: 1,
                lineItemType: 'INVENTORY',
                category: 'INVENTORY',
                count: 2,
                orderItemId: 'hi',
            }],
        });
        expect(spy.called).to.be.true;
    });

    it(`should fail if orderItems doesn't have count`, async () => {
        const spy = sinon.spy(logger, "error");
        await awaitPostError(token, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            orderItems: [{
                priceId: 1,
                lineItemType: 'INVENTORY',
                category: 'INVENTORY',
            }],
        });
        expect(spy.called).to.be.true;
    });

    it('should fail when orderId is invalid', async () => {
        const spy = sinon.spy(logger, "error");
        await assertPostResponseError({ 
            url: apiEndPoint,
            token,
            body: {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
                orderItems: [],
                orderId: -1,
            },
            code: 500,
        });
        expect(spy.called).to.be.true;
    });

    it('should succeed when orderId passed', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        await assertPostResponseSuccess({
            url: apiEndPoint,
            body: {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
                orderItems: [],
                orderId: order.id
            },
            token,
        })
    });

    it('should fail when removeConvenienceFee is invalid', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        const spy = sinon.spy(logger, "error");

        await assertPostResponseError({ 
            url: apiEndPoint,
            token,
            body: {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
                orderItems: [],
                orderId: order.id,
                removeConvenienceFee: 1
            },
            code: 422,
        });

        expect(spy.called).to.be.true;
    });

    it('should succeed when removeConvenienceFee is valid', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        await assertPostResponseSuccess({ 
            url: apiEndPoint,
            token,
            body: {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
                orderItems: [],
                orderId: order.id,
                removeConvenienceFee: true
            },
            token,
        });
    });
});
