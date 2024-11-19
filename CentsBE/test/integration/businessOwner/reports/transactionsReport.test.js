const momenttz = require('moment-timezone');
require('../../../testHelper');

const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

const API_ENDPOINT = '/api/v1/business-owner/orders/getTransactionsReport';

describe(`tests ${API_ENDPOINT}`, () => {
    let token, user, business, teamMember, store, serviceOrder, payment, storeCustomer;

    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, { userId: user.id });
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        token = generateToken({ id: user.id, teamMemberId: teamMember.id });
        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: business.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            userId: user.id,
            storeId: store.id,
            employeeCode: teamMember.id,
            netOrderTotal: 0,
            storeCustomerId: storeCustomer.id,
            orderCode: '1111',
            status: 'COMPLETED',
        });
        const orderMaster = await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });
        payment = await factory.create(FN.payment, {
            orderId: orderMaster.id,
            storeId: store.id,
            status: 'succeeded',
            createdAt: new Date('1-1-2021').toISOString(),
            updatedAt: new Date('1-1-2021').toISOString(),
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => API_ENDPOINT);

    it('should throw an error if there are no assigned locations', async () => {
        const user = await factory.create(FN.userWithBusinessOwnerRole);
        const business = await factory.create(FN.laundromatBusiness, { userId: user.id });
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        const token = generateToken({ id: user.id, teamMemberId: teamMember.id });

        const payloadSample = {
            startDate: new Date('1-1-2020').toISOString(),
            endDate: new Date().toISOString(),
            timeZone: 'America/New_York',
            allStoresCheck: true,
            status: 'COMPLETED_AND_ACTIVE',
            'stores[]': store.id,
        };

        await assertGetResponseError({
            url: API_ENDPOINT,
            params: payloadSample,
            token,
            code: 500,
            expectedError: 'No assigned Locations',
        });
    });

    it('should return expected result', async () => {
        const payloadSample = {
            startDate: new Date('1-1-2020').toISOString(),
            endDate: new Date().toISOString(),
            timeZone: 'America/New_York',
            allStoresCheck: 'false',
            status: 'COMPLETED_AND_ACTIVE',
            'stores[]': store.id,
        };

        const res = await assertGetResponseSuccess({
            url: API_ENDPOINT,
            params: payloadSample,
            token,
        });

        expect(res.body).to.have.property('success').to.be.true;
    });
});
