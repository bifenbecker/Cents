const sinon = require('sinon');
require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { locationType } = require('./../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const logger = require('../../../../lib/logger');

describe('test orderCalculations', () => {
    let store, token, centsCustomer, storeCustomer;
    const apiEndPoint = '/api/v1/employee-tab/home/orders/calculate-total';

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
        await assertPostResponseError({ 
            url: apiEndPoint,
            token,
            code: 422,
            expectedError: '"storeId" is required',
        });
        expect(spy.called).to.be.true;
    });

    it('should fail when centsCustomerId is not passed', async () => {
        const spy = sinon.spy(logger, "error");
        await assertPostResponseError({ 
            url: apiEndPoint,
            token,
            body: {
                storeId: store.id,
            },
            code: 422,
            expectedError: '"centsCustomerId" is required',
        });
        expect(spy.called).to.be.true;
    });

    it('should fail when orderItems are not passed', async () => {
        const spy = sinon.spy(logger, "error");
        const response = await assertPostResponseError({ 
            url: apiEndPoint,
            token,
            body: {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
            },
            code: 500,
        });
        const { error } = JSON.parse(response?.text);
        expect(spy.called).to.be.true;
    });

    it('should success when store type:STANDALONE', async () => {
        await assertPostResponseSuccess({
            url: apiEndPoint,
            body: {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
                orderItems: [],
            },
            token,
        });
    });

    it('should success when store type:INTAKE_ONLY', async () => {
        const intakeStore = await factory.create(FN.store, {
            type: locationType.INTAKE_ONLY,
        });
        const intakeToken = generateToken({
            id: intakeStore.id,
        });
        await assertPostResponseSuccess({
            url: apiEndPoint,
            body: {
                storeId: intakeStore.id,
                centsCustomerId: centsCustomer.id,
                orderItems: [],
            },
            token: intakeToken,
        });
    });
});
