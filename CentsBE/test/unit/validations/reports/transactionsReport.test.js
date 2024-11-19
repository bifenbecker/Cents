require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const transactionsReportValidation = require('../../../../validations/reports/transactionsReport');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');

const expectMissingParam = (paramName, query) => {
    delete query[paramName];
    const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
        query,
    });
    transactionsReportValidation(mockedReq, mockedRes, mockedNext);
    expectedResponseCall(422, (response) => {
        expect(response).to.be.eql({ error: `"${paramName}" is required` });
    });
};

describe('test transactionsReport validation', () => {
    let store, user, business, payloadSample;

    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, { userId: user.id });
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        payloadSample = {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            timeZone: 'America/New_York',
            allStoresCheck: 'false',
            status: 'COMPLETED_AND_ACTIVE',
            stores: [store.id],
        };
    });

    it('should call next when payload valid', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            query: payloadSample,
        });

        transactionsReportValidation(mockedReq, mockedRes, mockedNext);
        expectedNextCall();
    });

    it(`should fail when startDate not passed`, async () => {
        expectMissingParam('startDate', payloadSample);
    });

    it(`should fail when startDate not passed`, async () => {
        expectMissingParam('startDate', payloadSample);
    });

    it(`should fail when endDate not passed`, async () => {
        expectMissingParam('endDate', payloadSample);
    });

    it(`should fail when tz not passed`, async () => {
        expectMissingParam('timeZone', payloadSample);
    });

    it(`should fail when status not passed`, async () => {
        expectMissingParam('status', payloadSample);
    });

    it(`should fail when stores not passed`, async () => {
        expectMissingParam('stores', payloadSample);
    });
});
