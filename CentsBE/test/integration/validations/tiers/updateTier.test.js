require('../../../testHelper');

const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const API_ENDPOINT = '/api/v1/business-owner/admin/tiers';

async function checkForResponseError({ id, body, token, code, expectedError }) {
    // act
    const response = await ChaiHttpRequestHepler.patch(`${API_ENDPOINT}/${id}`, {}, body).set(
        'authtoken',
        token,
    );

    // assert
    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test updateTierValidation', () => {
    let user, business, teamMember, commercialTier, deliveryTier, token;

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        teamMember = await factory.create('teamMember', {
            userId: user.id,
            businessId: business.id,
        });
        commercialTier = await factory.create('commercialPricingTier', {
            businessId: business.id,
        });
        deliveryTier = await factory.create('pricingTierDelivery', {
            businessId: business.id,
        });

        token = generateToken({
            id: user.id,
            role: 1,
            teamMemberId: teamMember.id,
        });
    });

    it('should fail when token is not provided', async () => {
        // arrange
        const id = commercialTier.id;
        const body = {
            tier: commercialTier.type,
            commercialDeliveryFeeInCents: 100,
        };

        await checkForResponseError({
            id,
            body,
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should fail when tier id is invalid', async () => {
        // arrange
        const id = 42;
        const body = {
            commercialDeliveryFeeInCents: 100,
            type: commercialTier.type,
        };

        await checkForResponseError({
            id,
            body,
            token,
            code: 422,
            expectedError: 'Invalid tier id',
        });
    });

    it('should fail when tier name exists', async () => {
        // arrange
        const anotherCommercialTier = await factory.create('commercialPricingTier', {
            businessId: business.id,
        });

        const id = anotherCommercialTier.id;
        const body = {
            name: commercialTier.name,
            type: anotherCommercialTier.type,
        };

        await checkForResponseError({
            id,
            body,
            token,
            code: 422,
            expectedError: 'A commercial tier with the same name already exists',
        });
    });

    it('should fail when commercial delivery fee is invalid', async () => {
        // arrange
        const id = commercialTier.id;
        const body = {
            type: commercialTier.type,
            commercialDeliveryFeeInCents: -100,
        };

        await checkForResponseError({
            id,
            body,
            token,
            code: 422,
            expectedError: '"commercialDeliveryFeeInCents" must be larger than or equal to 0',
        });
    });

    it('should fail when delivery fee added to non commercial tier', async () => {
        // arrange
        const id = deliveryTier.id;
        const body = {
            type: deliveryTier.type,
            commercialDeliveryFeeInCents: 100,
        };

        await checkForResponseError({
            id,
            body,
            token,
            code: 422,
            expectedError: 'Commercial delivery fee can only be set for commercial tiers',
        });
    });
});
