require('../../../testHelper');

const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken, generateLiveLinkOrderToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const API_ENDPOINT = '/api/v1/delivery/estimate';

async function checkForResponseError({ params, token, code, expectedError }) {
    // act
    const response = await ChaiHttpRequestHepler.get(API_ENDPOINT, params).set('authtoken', token);

    // assert
    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

async function checkForResponseSuccess({ params, token }) {
    // act
    const response = await ChaiHttpRequestHepler.get(API_ENDPOINT, params).set('authtoken', token);

    // assert
    expect(response).to.have.status(200);
}

describe('test get estimate validator ', () => {
    let serviceOrder, store, token;

    beforeEach(async () => {
        const user = await factory.create('userWithBusinessOwnerRole');
        const business = await factory.create('laundromatBusiness', { userId: user.id });
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
            businessId: business.id,
        });
        store = await factory.create('store', {
            businessId: business.id,
        });
        await factory.create('ownDeliverySetting', {
            storeId: store.id,
        });

        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });

        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
            storeCustomerId: storeCustomer.id,
        });

        token = generateToken({
            id: user.id,
            role: 1,
            teamMemberId: teamMember.id,
        });
    });

    it('should fail when req query params are missing', async () => {
        // arrange
        const params = {};

        await checkForResponseError({
            params,
            token,
            code: 400,
            expectedError: '"storeId" is required',
        });
    });

    it('should pass when req query params are valid', async () => {
        // arrange
        const params = {
            storeId: store.id,
        };

        await checkForResponseSuccess({
            params,
            token,
        });
    });

    it('should pass when service order id token is provided', async () => {
        // arrange
        await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder.id,
        });

        const orderToken = generateLiveLinkOrderToken({ id: serviceOrder.id });

        const params = {
            storeId: store.id,
            token: orderToken,
        };

        await checkForResponseSuccess({
            params,
            token,
        });
    });
});
