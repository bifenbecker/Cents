require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const chaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const BusinessTheme = require('../../../../models/businessTheme');
const StoreTheme = require('../../../../models/storeTheme');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { THEME_ERRORS } = require('../../../../constants/error.messages');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

const getApiEndpoint = (themeId = '') => `/api/v1/super-admin/themes/business/${themeId}`;

describe('test updateBusinessTheme endpoint', () => {
    const customUrl = 'custom-url';
    const newTheme = {
        borderRadius: '0px',
        logoUrl: 'new-logo-url',
        primaryColor: '#f5a442',
    };
    const initialTheme = {
        primaryColor: '#3D98FF',
        borderRadius: '31px',
        logoUrl: 'https://cents-product-images.s3.us-east-2.amazonaws.com/Cents+LOGO.png',
    };
    let business;
    let businessTheme;
    let authToken;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        businessTheme = await BusinessTheme.query()
            .where({ businessId: business.id })
            .orderBy('createdAt')
            .first();
        await factory.create(FACTORIES_NAMES.storeTheme, {
            businessId: business.id,
        });

        await factory.create('role', { userType: 'Super Admin' });
        const user = await factory.create('userWithSuperAdminRole');
        authToken = generateToken({ id: user.id });
    });

    describe('should return correct response', () => {
        it('should update business theme and store themes with customUrl', async () => {
            const apiEndpoint = getApiEndpoint(businessTheme.id);
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { ...newTheme, initialTheme, customUrl })
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedBusinessTheme = await BusinessTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(updatedBusinessTheme).deep.include(newTheme);

            const updatedStoreTheme = await StoreTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(updatedStoreTheme).deep.include(newTheme);
        });

        it('should update business theme and store themes with empty customUrl', async () => {
            const apiEndpoint = getApiEndpoint(businessTheme.id);
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { ...newTheme, initialTheme, customUrl: '' })
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedBusinessTheme = await BusinessTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(updatedBusinessTheme).deep.include(newTheme);

            const updatedStoreTheme = await StoreTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(updatedStoreTheme).deep.include(newTheme);
        });

        it('should update business theme and store themes without customUrl', async () => {
            const apiEndpoint = getApiEndpoint(businessTheme.id);
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { ...newTheme, initialTheme })
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedBusinessTheme = await BusinessTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(updatedBusinessTheme).deep.include(newTheme);

            const updatedStoreTheme = await StoreTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(updatedStoreTheme).deep.include(newTheme);
        });
    });

    describe('should return correct error', () => {
        it('with invalid businessId', async () => {
            const apiEndpoint = getApiEndpoint(MAX_DB_INTEGER);
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { initialTheme, ...newTheme })
                .set('authtoken', authToken);

            expect(res.status).equal(400);
            expect(res.body).have.property('error', THEME_ERRORS.noSuchTheme);
        });

        it('with invalid color', async () => {
            const apiEndpoint = getApiEndpoint(businessTheme.id);
            const res = await chaiHttpRequestHelper
                .patch(
                    apiEndpoint,
                    {},
                    { ...newTheme, initialTheme, primaryColor: 'primary-color' },
                )
                .set('authtoken', authToken);

            expect(res.status).equal(400);
            expect(res.body).have.property('error', THEME_ERRORS.hexColor);
        });

        it('with custom url like encodedId', async () => {
            const apiEndpoint = getApiEndpoint(businessTheme.id);
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { ...newTheme, initialTheme, customUrl: 'N3Jq' })
                .set('authtoken', authToken);

            expect(res.status).equal(400);
            expect(res.body).have.property('error', THEME_ERRORS.invalidCustomUtl);
        });

        it('with numerical custom url', async () => {
            const apiEndpoint = getApiEndpoint(businessTheme.id);
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { ...newTheme, initialTheme, customUrl: '32443' })
                .set('authtoken', authToken);

            expect(res.status).equal(400);
            expect(res.body).have.property('error', THEME_ERRORS.numericalCustomUrl);
        });

        describe('should transform custom url to kebab case', () => {
            it('with busy custom url', async () => {
                await factory.create(FACTORIES_NAMES.businessTheme, {
                    businessId: business.id,
                    customUrl,
                });

                const apiEndpoint = getApiEndpoint(businessTheme.id);
                const res = await chaiHttpRequestHelper
                    .patch(apiEndpoint, {}, { ...newTheme, initialTheme, customUrl: 'custom url' })
                    .set('authtoken', authToken);

                expect(res.status).equal(400);
                expect(res.body).have.property('error', THEME_ERRORS.customUrlIsNotUniq);
            });
        });
    });
});
