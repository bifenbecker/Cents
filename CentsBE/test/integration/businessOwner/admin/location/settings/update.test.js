require('../../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../../support/apiTestHelper');
const factory = require('../../../../../factories');
const { FACTORIES_NAMES } = require('../../../../../constants/factoriesNames');
const { expect } = require('../../../../../support/chaiHelper');
const StoreSettings = require('../../../../../../models/storeSettings');
const baseUrl = '/api/v1/business-owner/admin/locations/settings/';

describe('test get delivery settings', () => {
    let user, authToken, business, store, storeSettings;
    beforeEach(async () => {
        await factory.create(FACTORIES_NAMES.role, { userType: 'Business Owner' });
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        storeSettings = await StoreSettings.query().findOne({ storeId: store.id });
        authToken = generateToken({
            id: user.id,
        });
    });

    describe('Without auth token', () => {
        it('should return Unauthorized when no auth token provided', async () => {
            const response = await ChaiHttpRequestHepler.patch(`${baseUrl}/${store.id}`).set(
                'authtoken',
                '',
            );
            response.should.have.status(401);
            expect(response.body).to.have.property('error').equal('Please sign in to proceed.');
        });
    });

    describe('With auth token', async () => {
        it('should update StoreSetting model and return the full model', async () => {
            const body = {
                offerDryCleaningForDelivery: true,
                dryCleaningDeliveryPriceType: 'DELIVERY_TIER',
                customLiveLinkHeader: 'Howdy!',
                customLiveLinkMessage: 'Schedule your next laundry service below!',
            };
            const response = await ChaiHttpRequestHepler.patch(
                `${baseUrl}/${store.id}`,
                {},
                body,
            ).set('authtoken', authToken);

            expect(response.body.storeSettings.id).to.equal(storeSettings.id);
            expect(response.body.storeSettings.offerDryCleaningForDelivery).to.equal(
                body.offerDryCleaningForDelivery,
            );
            expect(response.body.storeSettings.dryCleaningDeliveryPriceType).to.equal(
                body.dryCleaningDeliveryPriceType,
            );
            expect(response.body.storeSettings.customLiveLinkHeader).to.equal(
                body.customLiveLinkHeader,
            );
            expect(response.body.storeSettings.customLiveLinkMessage).to.equal(
                body.customLiveLinkMessage,
            );
        });
    });
});
