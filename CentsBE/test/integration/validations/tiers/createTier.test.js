require('../../../testHelper');

const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const API_ENDPOINT = '/api/v1/business-owner/admin/tiers/create';

async function checkForResponseError({ body, token, code, expectedError }) {
    // act
    const response = await ChaiHttpRequestHepler.post(API_ENDPOINT, {}, body).set(
        'authtoken',
        token,
    );

    // assert
    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test createTierValidation ', () => {
    let user, business, teamMember, commercialTier, deliveryTier, token;

    beforeEach(async () => {
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
        // arrange
        const body = {
            name: 'tier1',
            commercialDeliveryFeeInCents: 100,
            type: 'COMMERCIAL',
            servicePrices: [
                {
                    isFeatured: true,
                    isDeliverable: true,
                },
            ],
        };

        await checkForResponseError({
            body,
            code: 401,
            token: '',
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should fail when req body params are missing', async () => {
        // arrange
        const body = {
            commercialDeliveryFeeInCents: 100,
            type: 'COMMERCIAL',
            servicePrices: [
                {
                    isFeatured: false,
                    isDeliverable: false,
                },
            ],
        };

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: '"name" is required',
        });
    });

    it('should fail when no services are selected', async () => {
        // arrange
        const body = {
            name: 'tier1',
            commercialDeliveryFeeInCents: 100,
            type: 'COMMERCIAL',
            servicePrices: [
                {
                    isFeatured: false,
                    isDeliverable: false,
                },
            ],
        };

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'At least one service must be selected to create a pricing tier',
        });
    });

    it('should fail when commercial delivery fee is invalid', async () => {
        // arrange
        const body = {
            name: 'tier1',
            commercialDeliveryFeeInCents: -100,
            type: 'COMMERCIAL',
            servicePrices: [
                {
                    isFeatured: true,
                    isDeliverable: true,
                },
            ],
        };

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: '"commercialDeliveryFeeInCents" must be larger than or equal to 0',
        });
    });

    it('should fail when delivery fee added to non commercial tier', async () => {
        // arrange
        const body = {
            name: 'tier1',
            commercialDeliveryFeeInCents: 100,
            type: 'DELIVERY',
            servicePrices: [
                {
                    isFeatured: true,
                    isDeliverable: true,
                },
            ],
        };

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'Commercial delivery fee can only be set for commercial tiers',
        });
    });

    it('should fail when offerDryCleaningForDeliveryTier is not a boolean', async () => {
        // arrange
        const body = {
            name: 'tier1',
            commercialDeliveryFeeInCents: null,
            type: 'DELIVERY',
            servicePrices: [
                {
                    isFeatured: true,
                    isDeliverable: true,
                },
            ],
            offerDryCleaningForDeliveryTier: 'hey',
        };

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: '"offerDryCleaningForDeliveryTier" must be a boolean',
        });
    });

    it('should fail when locationId is not a number', async () => {
        // arrange
        const body = {
            name: 'tier1',
            commercialDeliveryFeeInCents: null,
            type: 'DELIVERY',
            servicePrices: [
                {
                    isFeatured: true,
                    isDeliverable: true,
                },
            ],
            locationId: true,
        };

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: '"locationId" must be a number',
        });
    });
});
