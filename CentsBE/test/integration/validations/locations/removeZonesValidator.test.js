const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const getAPIEndPoint = ({ storeId, zoneId }) => `/api/v1/business-owner/admin/locations/${storeId}/zones/${zoneId}`;

async function checkForResponseError({ storeId, zoneId, token, code, expectedError }) {
    // act
    const response = await ChaiHttpRequestHepler.delete(
        getAPIEndPoint({ storeId, zoneId }),
        {},
        {},
    ).set('authtoken', token);

    // assert
    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test removeZonesValidator', () => {
    let zone, ownDeliverySettings, store, storeId, zoneId;

    beforeEach(async () => {
        store = await factory.create('store');
        ownDeliverySettings = await factory.create('ownDeliverySetting', {
            storeId: store.id,
            hasZones: true,
        });
        zone = await factory.create('zone', {
            ownDeliverySettingsId: ownDeliverySettings.id,
            deletedAt: new Date().toISOString(),
        });
        storeId = store.id;
        zoneId = zone.id;

        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        teamMember = await factory.create('teamMember', {
            userId: user.id,
            businessId: business.id,
        });
        token = generateToken({
            id: user.id,
            role: 1,
            teamMemberId: teamMember.id,
        });
    });

    it('should fail when token is not provided', async () => {
        await checkForResponseError({
            storeId,
            zoneId,
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should fail when storeId is not there', async () => {
        await checkForResponseError({
            storeId: null,
            zoneId,
            token,
            code: 422,
            expectedError: 'storeId is required/invalid.',
        });
    });

    it('should fail when storeId is not valid', async () => {
        await checkForResponseError({
            storeId: "storeId-123",
            zoneId,
            token,
            code: 422,
            expectedError: 'storeId is required/invalid.',
        });
    });

    it('should fail when zoneId is not there', async () => {
        await checkForResponseError({
            storeId,
            zoneId: null,
            token,
            code: 422,
            expectedError: 'zoneId is required/invalid.',
        });
    });

    it('should fail when zoneId is not valid', async () => {
        await checkForResponseError({
            storeId,
            zoneId: "zoneId-123",
            token,
            code: 422,
            expectedError: 'zoneId is required/invalid.',
        });
    });

    it('should fail when zone does not exist', async () => {
        await checkForResponseError({
            storeId,
            zoneId: 0,
            token,
            code: 422,
            expectedError: 'Zone does not exist',
        });
    });

    it('should fail when zone is already removed', async () => {
        await checkForResponseError({
            storeId,
            zoneId,
            token,
            code: 422,
            expectedError: 'Zone is already removed',
        });
    });
});
