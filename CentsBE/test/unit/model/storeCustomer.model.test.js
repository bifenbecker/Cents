require('../../testHelper');
const { expect } = require('../../support/chaiHelper');

const {
    hasTable,
    hasAssociation,
    belongsToOne,
    hasMany,
} = require('../../support/objectionTestHelper');
const BusinessCustomer = require('../../../models/businessCustomer');
const StoreCustomer = require('../../../models/storeCustomer');
const factory = require('../../factories');

describe('test storeCustomer model', () => {
    it('should return true if storeCustomers table exists', async () => {
        const hasTableName = await hasTable(StoreCustomer.tableName);
        expect(hasTableName).to.be.true;
    });

    it('storeCustomers should have centsCustomer association', () => {
        hasAssociation(StoreCustomer, 'centsCustomer');
    });

    it('storeCustomers should BelongsToOneRelation centsCustomer association', () => {
        belongsToOne(StoreCustomer, 'centsCustomer');
    });

    it('storeCustomers should have store association', () => {
        hasAssociation(StoreCustomer, 'store');
    });

    it('storeCustomers should BelongsToOneRelation store association', () => {
        belongsToOne(StoreCustomer, 'store');
    });

    it('storeCustomers should have turns association', () => {
        hasAssociation(StoreCustomer, 'turns');
    });

    it('storeCustomers should have many turns association', () => {
        hasMany(StoreCustomer, 'turns');
    });

    it('storeCustomers should have business association', () => {
        hasAssociation(StoreCustomer, 'business');
    });

    it('storeCustomers should BelongsToOneRelation business association', () => {
        belongsToOne(StoreCustomer, 'business');
    });

    it('storeCustomers should have orderDeliveries association', () => {
        hasAssociation(StoreCustomer, 'orderDeliveries');
    });

    it('storeCustomers should have many orderDeliveries association', () => {
        hasMany(StoreCustomer, 'orderDeliveries');
    });

    it('storeCustomers should have businessCustomer association', () => {
        hasAssociation(StoreCustomer, 'businessCustomer');
    });

    it('storeCustomers should BelongsToOneRelation businessCustomer association', () => {
        belongsToOne(StoreCustomer, 'businessCustomer');
    });

    it('storeCustomer model should have getCentsCustomer method when created', async () => {
        const storeCustomer = await factory.create('storeCustomer');
        expect(storeCustomer.getCentsCustomer).to.be.a('function');
    });

    it('storeCustomer model getCentsCustomer method should return centsCustomer', async () => {
        const centsCustomer = await factory.create('centsCustomer'),
            storeCustomer = await factory.create('storeCustomer', {
                centsCustomerId: centsCustomer.id,
            });
        expect((await storeCustomer.getCentsCustomer()).id).to.be.eq(centsCustomer.id);
    });

    it('storeCustomer model should have getStore method when created', async () => {
        const storeCustomer = await factory.create('storeCustomer');
        expect(storeCustomer.getStore).to.be.a('function');
    });

    it('storeCustomer model getStore method should return store', async () => {
        const store = await factory.create('store'),
            storeCustomer = await factory.create('storeCustomer', {
                storeId: store.id,
            });
        expect((await storeCustomer.getStore()).id).to.be.eq(store.id);
    });

    it('storeCustomer model should have getBusiness method when created', async () => {
        const storeCustomer = await factory.create('storeCustomer');
        expect(storeCustomer.getBusiness).to.be.a('function');
    });

    it('storeCustomer model getBusiness method should return store', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness'),
            storeCustomer = await factory.create('storeCustomer', {
                businessId: laundromatBusiness.id,
            });
        expect((await storeCustomer.getBusiness()).id).to.be.eq(laundromatBusiness.id);
    });

    it('storeCustomer model should have languageId field when created', async () => {
        const storeCustomer = await factory.create('storeCustomer');
        expect(storeCustomer.languageId).to.not.be.undefined;
    });

    it('storeCustomer model should trim notes field when created', async () => {
        const storeCustomer = await factory.create('storeCustomer', {
            notes: '   Some notes value  ',
        });
        expect(storeCustomer.notes).to.be.eq('Some notes value');
    });

    it('storeCustomers model should create or update businessCustomer for afterInsert hook', async () => {
        const storeCustomer = await factory.create('storeCustomer');
        const createdOrUpdatedBusinessCustomersArray = await BusinessCustomer.query().where({
            businessId: storeCustomer.businessId,
            centsCustomerId: storeCustomer.centsCustomerId,
        });

        expect(createdOrUpdatedBusinessCustomersArray).to.have.lengthOf(1);
    });
});
