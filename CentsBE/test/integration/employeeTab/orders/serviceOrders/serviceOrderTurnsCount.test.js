require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { 
    assertGetResponseError, 
    assertGetResponseSuccess, 
    itShouldCorrectlyAssertTokenPresense
} = require('../../../../support/httpRequestsHelper');
const { createServiceOrderTurn } = require('../../../../support/serviceOrderTestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');

const getApiEndPoint = serviceOrderId => `/api/v1/employee-tab/orders/service-orders/${serviceOrderId}/turns-count`

describe(`test ${getApiEndPoint(':serviceOrderId')} endpoint`, () => {
    let serviceOrder, token;

    beforeEach(async () => {
        const storeCustomer = await factory.create(FN.storeCustomer);
        const {id: storeCustomerId, storeId} = storeCustomer;

        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId,
            storeCustomerId,
        });

        const dryer = await factory.create(FN.machineDryer, { storeId });
        const washer = await factory.create(FN.machineWasher, { storeId });
        await createServiceOrderTurn(serviceOrder, dryer);
        await createServiceOrderTurn(serviceOrder, washer);

        token = generateToken({ id: storeId });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(serviceOrder.id)
    );

    it('should successfully return turn count for service order if everyting is in place', async () => {
        const res = await assertGetResponseSuccess({
            url: getApiEndPoint(serviceOrder.id),
            token
        });

        expect(res.body).to.eql({
            success: true,
            dryerTurnsCount: 1,
            washerTurnsCount: 1
        });
    });


    it('should return 0 counts for serviceOrder that does not exists', async () => {
        const res = await assertGetResponseSuccess({
            url: getApiEndPoint(-1),
            token
        });

        expect(res.body).to.eql({
            success: true,
            dryerTurnsCount: 0,
            washerTurnsCount: 0
        });
    });

    it('should reject if `serviceOrderId` is not a number', async () => {
        const res = await assertGetResponseError({
            url: getApiEndPoint('abc'),
            token,
            code: 500
        });
    });
});