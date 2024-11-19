require('../../testHelper');
const { expect, assert } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasManyToMany,
    hasOne,
    hasMany,
    hasOneThrough,
} = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const LaundromatBusiness = require('../../../models/laundromatBusiness');
const ServiceCategories = require('../../../models/serviceCategories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test LaundromatBusiness model', () => {
    it('should return true if laundromatBusiness table exists', async () => {
        const hasTableName = await hasTable(LaundromatBusiness.tableName);
        expect(hasTableName).to.be.true;
    });

    it('LaundromatBusiness should have locations association', async () => {
        hasAssociation(LaundromatBusiness, 'locations');
    });

    it('LaundromatBusiness should HasManyRelation locations association', async () => {
        hasMany(LaundromatBusiness, 'locations');
    });

    it('LaundromatBusiness should have devices association', async () => {
        hasAssociation(LaundromatBusiness, 'devices');
    });

    it('LaundromatBusiness should HasManyRelation devices association', async () => {
        hasMany(LaundromatBusiness, 'devices');
    });

    it('LaundromatBusiness should have user association', async () => {
        hasAssociation(LaundromatBusiness, 'user');
    });

    it('LaundromatBusiness should HasOneRelation user association', async () => {
        hasOne(LaundromatBusiness, 'user');
    });

    it('LaundromatBusiness should have batches association', async () => {
        hasAssociation(LaundromatBusiness, 'batches');
    });

    it('LaundromatBusiness should HasManyRelation batches association', async () => {
        hasMany(LaundromatBusiness, 'batches');
    });

    it('LaundromatBusiness should have stores association', async () => {
        hasAssociation(LaundromatBusiness, 'stores');
    });

    it('LaundromatBusiness should HasManyRelation stores association', async () => {
        hasMany(LaundromatBusiness, 'stores');
    });

    it('LaundromatBusiness should have regions association', async () => {
        hasAssociation(LaundromatBusiness, 'regions');
    });

    it('LaundromatBusiness should HasManyRelation regions association', async () => {
        hasMany(LaundromatBusiness, 'regions');
    });

    it('LaundromatBusiness should have tasks association', async () => {
        hasAssociation(LaundromatBusiness, 'tasks');
    });

    it('LaundromatBusiness should HasManyRelation tasks association', async () => {
        hasMany(LaundromatBusiness, 'tasks');
    });

    it('LaundromatBusiness should have storeCustomers association', async () => {
        hasAssociation(LaundromatBusiness, 'storeCustomers');
    });

    it('LaundromatBusiness should HasManyRelation storeCustomers association', async () => {
        hasMany(LaundromatBusiness, 'storeCustomers');
    });

    it('LaundromatBusiness should have promotionPrograms association', async () => {
        hasAssociation(LaundromatBusiness, 'promotionPrograms');
    });

    it('LaundromatBusiness should HasManyRelation promotionPrograms association', async () => {
        hasMany(LaundromatBusiness, 'promotionPrograms');
    });

    it('LaundromatBusiness should have settings association', async () => {
        hasAssociation(LaundromatBusiness, 'settings');
    });

    it('LaundromatBusiness should HasOneRelation settings association', async () => {
        hasOne(LaundromatBusiness, 'settings');
    });

    it('LaundromatBusiness should have tipSetting association', async () => {
        hasAssociation(LaundromatBusiness, 'tipSetting');
    });

    it('LaundromatBusiness should HasOneThroughRelation tipSetting association', async () => {
        hasOneThrough(LaundromatBusiness, 'tipSetting');
    });

    it('LaundromatBusiness should have esdReaders association', async () => {
        hasAssociation(LaundromatBusiness, 'esdReaders');
    });

    it('LaundromatBusiness should HasManyToManyRelation esdReaders association', async () => {
        hasManyToMany(LaundromatBusiness, 'esdReaders');
    });

    it('LaundromatBusiness should have subscriptionProducts association', async () => {
        hasAssociation(LaundromatBusiness, 'subscriptionProducts');
    });

    it('LaundromatBusiness should HasManyRelation subscriptionProducts association', async () => {
        hasMany(LaundromatBusiness, 'subscriptionProducts');
    });

    it('LaundromatBusiness should have subscription association', async () => {
        hasAssociation(LaundromatBusiness, 'subscription');
    });

    it('LaundromatBusiness should HasOneRelation subscription association', async () => {
        hasOne(LaundromatBusiness, 'subscription');
    });

    it('LaundromatBusiness should have termsOfServiceLog association', async () => {
        hasAssociation(LaundromatBusiness, 'termsOfServiceLog');
    });

    it('LaundromatBusiness should HasOneRelation termsOfServiceLog association', async () => {
        hasOne(LaundromatBusiness, 'termsOfServiceLog');
    });

    it('LaundromatBusiness should have businessTheme association', async () => {
        hasAssociation(LaundromatBusiness, 'businessTheme');
    });

    it('LaundromatBusiness should HasOneRelation businessTheme association', async () => {
        hasOne(LaundromatBusiness, 'businessTheme');
    });

    it('LaundromatBusiness should have convenienceFee association', async () => {
        hasAssociation(LaundromatBusiness, 'convenienceFee');
    });

    it('LaundromatBusiness should HasOneRelation convenienceFee association', async () => {
        hasOne(LaundromatBusiness, 'convenienceFee');
    });

    it('LaundromatBusiness should have bagNoteTags association', async () => {
        hasAssociation(LaundromatBusiness, 'bagNoteTags');
    });

    it('LaundromatBusiness should HasManyRelation bagNoteTags association', async () => {
        hasMany(LaundromatBusiness, 'bagNoteTags');
    });

    it('LaundromatBusiness should have BusinessTheme instance when created for afterInsert hook', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const businessesTheme = await laundromatBusiness.getBusinessTheme();
        expect(businessesTheme).to.not.be.undefined;
        expect(businessesTheme).to.not.be.null;
    });

    it('LaundromatBusiness should create ServiceCategory instances when created for afterInsert hook', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const createdServiceCategories = await ServiceCategories.query().where(
            'businessId',
            laundromatBusiness.id,
        );
        expect(createdServiceCategories).to.have.lengthOf(3);
    });

    it('LaundromatBusiness.getLocations() should return store', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getLocations();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), store);
    });

    it('LaundromatBusiness.getRegions() should return regions', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const region = await factory.create(FN.region, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getRegions();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), region);
    });

    it('LaundromatBusiness.getTasks() should return tasks', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const task = await factory.create(FN.task, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getTasks();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), task);
    });

    it('LaundromatBusiness.getBatches() should return batches', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const batch = await factory.create(FN.batch, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getBatches();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), batch);
    });

    it('LaundromatBusiness.storeCustomers() should return storeCustomers', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getStoreCustomers();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), storeCustomer);
    });

    it('LaundromatBusiness.getPromotionPrograms() should return promotionPrograms', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const { activeDays, ...promotionProgram } = await factory.create(FN.promotion, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getPromotionPrograms();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), promotionProgram);
    });

    it('LaundromatBusiness.getEsdReaders() should return esdReaders', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });
        const { deviceSerialNumber, ...esdReader } = await factory.create(FN.esdReader, {
            storeId: store.id,
        });

        const result = await laundromatBusiness.getEsdReaders();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), esdReader);
    });

    it('LaundromatBusiness.getSubscriptionProducts() should return subscriptionProducts', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const subscriptionProduct = await factory.create(FN.subscriptionProduct, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getSubscriptionProducts();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), subscriptionProduct);
    });

    it('LaundromatBusiness.getBusinessOwner() should return businessOwner', async () => {
        const user = await factory.create(FN.user);
        const laundromatBusiness = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });

        const result = await laundromatBusiness.getBusinessOwner();

        assert.deepOwnInclude(JSON.parse(JSON.stringify(result)), user);
    });

    it('LaundromatBusiness.getTermsOfServiceLog() should return businessSubscription', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const termsOfServiceLog = await factory.create(FN.termsOfServiceLog, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getTermsOfServiceLog();

        assert.deepOwnInclude(JSON.parse(JSON.stringify(result)), termsOfServiceLog);
    });

    it('LaundromatBusiness.getBusinessTheme() should return businessTheme', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const businessTheme = await factory.create(FN.businessTheme, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getBusinessTheme();

        expect(result).to.be.an('array').to.have.lengthOf(2);
        assert.deepOwnInclude(
            JSON.parse(JSON.stringify(result.find((theme) => theme.id === businessTheme.id))),
            businessTheme,
        );
    });

    it('LaundromatBusiness.getConvenienceFee() should return convenienceFee', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const convenienceFee = await factory.create(FN.convenienceFee, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getConvenienceFee();

        assert.deepOwnInclude(JSON.parse(JSON.stringify(result)), convenienceFee);
    });

    it('LaundromatBusiness.getBagNoteTags() should return subscriptionProducts', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const bagNoteTags = await factory.create(FN.bagNoteTag, {
            businessId: laundromatBusiness.id,
        });

        const result = await laundromatBusiness.getBagNoteTags();

        expect(result).to.be.an('array').to.have.lengthOf(1);
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result[0])), bagNoteTags);
    });
});
