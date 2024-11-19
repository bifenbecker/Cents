const moment = require('moment');
const { omit } = require('lodash');

const factory = require('../../../factories');
const StoreSettings = require('../../../../models/storeSettings');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');

describe('Test Sales By Service Category params', () => {
    const ENDPOINT_URL = '/api/v1/business-owner/reports/categories/sales';
    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        store = await factory.create('store', {
            businessId: business.id,
        });
        store2 = await factory.create('store', { businessId: business.id });
        await StoreSettings.query()
            .patch({
                timeZone: 'America/Los_Angeles',
            })
            .whereIn('storeId', [store.id, store2.id]);

        params = {
            startDate: moment().tz('America/Los_Angeles').format(),
            endDate: moment().tz('America/Los_Angeles').add('6', 'd').format(),
            timeZone: 'America/Los_Angeles',
            status: 'COMPLETED_AND_ACTIVE',
            stores: [store.id, store2.id],
        };
        teamMember = await factory.create('teamMember', {
            userId: user.id,
            businessId: business.id,
        });
        token = await generateToken({ id: user.id, teamMemberId: teamMember.id });
    });
    describe('validate query params', () => {
        it('should respond with 422 when startDate is missing', async () => {
            await assertGetResponseError({
                url: ENDPOINT_URL,
                params: omit(params, 'startDate'),
                token: token,
                code: 422,
                expectedError: '"startDate" is required',
            });
        });
        it('should respond with 422 when endDate is missing', async () => {
            await assertGetResponseError({
                url: ENDPOINT_URL,
                params: omit(params, 'endDate'),
                token: token,
                code: 422,
                expectedError: '"endDate" is required',
            });
        });
        it('should respond with 422 when timeZone is missing', async () => {
            await assertGetResponseError({
                url: ENDPOINT_URL,
                params: omit(params, 'timeZone'),
                token: token,
                code: 422,
                expectedError: '"timeZone" is required',
            });
        });

        it('should respond with 422 when allStoresCheck is false and stores is missing', async () => {
            await assertGetResponseError({
                url: ENDPOINT_URL,
                params: omit(params, ['allStoresCheck', 'stores']),
                token: token,
                code: 422,
                expectedError: '"stores" is required',
            });
        });

        it('should respond with 422 when status is missing', async () => {
            await assertGetResponseError({
                url: ENDPOINT_URL,
                params: omit(params, 'status'),
                token: token,
                code: 422,
                expectedError: '"status" is required',
            });
        });

        it('should respond with 200 when required params are present', async () => {
            await assertGetResponseSuccess({
                url: ENDPOINT_URL,
                params,
                token,
            });
        });
    });
    describe('when allStoresCheck is true', () => {
        let expected;
        beforeEach(async () => {
            params = {
                allStoresCheck: 'true',
                startDate: '2022-05-09T12:59:32.582Z',
                endDate: '2022-05-11T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                status: 'COMPLETED_AND_ACTIVE',
            };
            expected = {
                options: {
                    stores: [store.id, store2.id],
                    storeCount: 2,
                },
            };
        });
        describe('when business owner', () => {
            it('fetch data from all stores', async () => {
                await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });
            });
        });
        describe('when business manager', () => {
            it('fetch data from assigned stores', async () => {
                user = await factory.create('userWithBusinessOwnerRole');
                // create business manager role
                await factory.create('userRole', {
                    userId: user.id,
                    roleId: factory.assoc('role', 'id', {
                        userType: 'Business Manager',
                    }),
                });
                await factory.create('teamMemberStore', {
                    teamMemberId: teamMember.id,
                    storeId: store.id,
                });
                await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });
                expected.options.stores = [store.id];
                expected.options.storeCount = 1;
            });
        });
    });
});
