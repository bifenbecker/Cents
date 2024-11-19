require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const chaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const StoreTheme = require('../../../../models/storeTheme');
const Store = require('../../../../models/store');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

const getApiEndpoint = (storeThemeId = '') => `/api/v1/super-admin/themes/store/${storeThemeId}`;

describe('test updateStoreTheme endpoint', () => {
    let authToken;

    beforeEach(async () => {
        await factory.create('role', { userType: 'Super Admin' });
        const user = await factory.create('userWithSuperAdminRole');
        authToken = generateToken({ id: user.id });
    });

    describe('should return correct response', () => {
        const customUrl = 'custom-url';
        const newName = 'new-name';
        const newThemeObj = {
            borderRadius: '0px',
            logoUrl: 'new-logo-url',
            primaryColor: '#f5a442',
        };

        let business;
        let store;
        let storeTheme;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            newThemeObj.storeId = store.id;
            storeTheme = await store.getStoreTheme();
        });

        it('with transformed to kebab case custom url and name', async () => {
            const apiEndpoint = getApiEndpoint(storeTheme.id);

            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { ...newThemeObj, customUrl: 'custom url', name: newName })
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedStoreTheme = await StoreTheme.query().findById(storeTheme.id);
            expect(updatedStoreTheme, 'should set custom url').have.property(
                'customUrl',
                customUrl,
            );

            const updatedStore = await Store.query().findById(store.id);
            expect(updatedStore, 'should set new name').have.property('name', newName);
        });

        it('without custom url and without name', async () => {
            const apiEndpoint = getApiEndpoint(storeTheme.id);

            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, newThemeObj)
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedStoreTheme = await StoreTheme.query().findById(storeTheme.id);
            expect(updatedStoreTheme, 'should update values').deep.include(newThemeObj);
        });

        it('with empty custom url and without name', async () => {
            const apiEndpoint = getApiEndpoint(storeTheme.id);

            await StoreTheme.query().patch({ customUrl }).findById(storeTheme.id);

            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { ...newThemeObj, customUrl: '' })
                .set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('success', true);

            const updatedStoreTheme = await StoreTheme.query().findById(storeTheme.id);
            expect(updatedStoreTheme, 'should remove customUrl').have.property('customUrl', null);
        });
    });

    describe('should return error response', () => {
        it('with incorrect themeId', async () => {
            const apiEndpoint = getApiEndpoint(MAX_DB_INTEGER);
            const res = await chaiHttpRequestHelper
                .patch(apiEndpoint, {}, { name: 'new name' })
                .set('authtoken', authToken);

            expect(res.status).equal(500);
        });
    });
});
