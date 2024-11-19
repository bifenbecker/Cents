require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const {
    getSettings,
    getBusinessTheme,
    getTipSettings,
    getStoreTheme
} = require('../../../../../services/liveLink/queries/stores');
const StoreTheme = require('../../../../../models/storeTheme');
const BusinessTheme = require('../../../../../models/businessTheme');
const BusinessSettings = require('../../../../../models/businessSettings');

describe('queries/stores.js tests', function () {
    describe('getSettings method', function () {
        it('should return settings with business theme when wrong store id and correct business id is provided', async function () {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                name: 'Nike',
            });

            const settings = await getSettings(23, business.id);

            const businessTheme = await BusinessTheme.query().findOne({
                businessId: business.id,
            });

            expect(settings).to.have.property('theme').to.be.an('object');
            expect(settings).to.have.property('tipOptions').to.be.an('array');
            expect(settings).to.have.property('tipType').to.be.a('string');
            expect(settings.theme).to.deep.equal({
                id: business.id,
                businessName: business.name,
                ...businessTheme,
            });
            expect(settings.tipType).to.equal('');
            expect(settings.tipOptions).to.deep.equal([]);
        });
        it('should return settings with store theme when store id and business id is provided', async function () {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                name: 'Nike',
            });
            const store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });

            const storeTheme = await StoreTheme.query().findOne({
                storeId: store.id,
            });

            const settings = await getSettings(store.id, business.id);

            expect(settings).to.have.property('theme').to.be.an('object');
            expect(settings).to.have.property('tipOptions').to.be.an('array');
            expect(settings).to.have.property('tipType').to.be.a('string');
            expect(settings.theme).to.deep.equal({
                id: business.id,
                businessName: business.name,
                ...storeTheme,
            });
            expect(settings.tipType).to.equal('');
            expect(settings.tipOptions).to.deep.equal([]);
        });
    });
    describe('getBusinessTheme method', function () {
        it('should return business theme by business id', async function () {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);

            const businessTheme = await BusinessTheme.query().findOne({
                businessId: business.id,
            });

            const actualBusinessTheme = await getBusinessTheme(business.id);

            expect(actualBusinessTheme).to.deep.equal({
                ...businessTheme,
                businessName: business.name,
            });
        });
    });
    describe('getStoreTheme', function () {
        it('should return store theme', async function () {
            const store = await factory.create(FACTORIES_NAMES.store)

            const storeTheme = await StoreTheme.query().findOne({
                storeId: store.id,
            });

            const actualStoreTheme = await getStoreTheme(store.id);

            expect(actualStoreTheme).to.deep.equal(storeTheme);
        });
    });
    describe('getTipSettings', function () {
        it('should return default tip settings by business id if allowInStoreTip false', async function () {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);

            const tipSettings = await getTipSettings(business.id);

            expect(tipSettings).to.deep.equal({
                tipType: '',
                tipOptions: [],
            });
        });
        it('should return tip settings by business id if allowInStoreTip true', async function () {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            await factory.create(FACTORIES_NAMES.tipSetting, {
                businessId: business.id,
            });

            await BusinessSettings.query()
                .update({
                    allowInStoreTip: true,
                })
                .where('businessSettings.businessId', business.id);

            const actualTipSettings = await getTipSettings(business.id);

            expect(actualTipSettings).to.deep.equal({
                tipType: 'DOLLAR_AMOUNT',
                tipOptions: ['$1.00', '$5.00', '$10.00'],
            });
        });
    });
});
