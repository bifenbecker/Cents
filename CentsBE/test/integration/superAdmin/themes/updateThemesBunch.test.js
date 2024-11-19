require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const chaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const BusinessTheme = require('../../../../models/businessTheme');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const apiEndpoint = '/api/v1/super-admin/themes/bunch';

describe('test updateThemesBunch endpoint', () => {
    let authToken;

    beforeEach(async () => {
        await factory.create('role', { userType: 'Super Admin' });
        const user = await factory.create('userWithSuperAdminRole');
        authToken = generateToken({ id: user.id });
    });

    describe('should return correct response', () => {
        const newThemeObj = {
            borderRadius: '0px',
            logoUrl: 'new-logo-url',
            primaryColor: '#f5a442',
        };

        let business;
        let businessTheme;
        let store;
        let storeTheme;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            storeTheme = await store.getStoreTheme();
            businessTheme = await BusinessTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
        });

        it('should update business and store themes', async () => {
            const res = await chaiHttpRequestHelper
                .patch(
                    apiEndpoint,
                    {},
                    {
                        ...newThemeObj,
                        storeThemeIds: [storeTheme.id],
                        businessThemeId: businessTheme.id,
                    },
                )
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedBusinessTheme = await BusinessTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(updatedBusinessTheme, 'should update business theme properties').deep.include(
                newThemeObj,
            );

            const updatedStoreTheme = await store.getStoreTheme();
            expect(updatedStoreTheme, 'should update store theme properties').deep.include(
                newThemeObj,
            );
        });

        it('should update only store themes', async () => {
            const res = await chaiHttpRequestHelper
                .patch(
                    apiEndpoint,
                    {},
                    {
                        ...newThemeObj,
                        storeThemeIds: [storeTheme.id],
                    },
                )
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedBusinessTheme = await BusinessTheme.query()
                .where({ businessId: business.id })
                .orderBy('createdAt')
                .first();
            expect(
                updatedBusinessTheme,
                'should update business theme properties',
            ).to.not.deep.include(newThemeObj);

            const updatedStoreTheme = await store.getStoreTheme();
            expect(updatedStoreTheme, 'should update store theme properties').deep.include(
                newThemeObj,
            );
        });
    });

    describe('should return error response', () => {
        it('with incorrect themeId', async () => {
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { businessThemeId: undefined })
                .set('authtoken', authToken);

            expect(res.status).equal(500);
        });
    });
});
