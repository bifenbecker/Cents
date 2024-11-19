require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const CentsCustomer = require('../../../models/centsCustomer');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test centsCustomer model', () => {
    it('should return true if centsCustomers table exists', async () => {
        const hasTableName = await hasTable(CentsCustomer.tableName);
        expect(hasTableName).to.be.true;
    });

    it('centsCustomers should have addresses association', () => {
        hasAssociation(CentsCustomer, 'addresses');
    });

    it('centsCustomers should have many centsCustomerAddresses association', async () => {
        hasMany(CentsCustomer, 'addresses');
    });

    it('centsCustomers should have storeCustomers association', async () => {
        hasAssociation(CentsCustomer, 'storeCustomers');
    });

    it('centsCustomers should have many storeCustomers association', async () => {
        hasMany(CentsCustomer, 'storeCustomers');
    });

    it('centsCustomers should have paymentMethods association', async () => {
        hasAssociation(CentsCustomer, 'paymentMethods');
    });

    it('centsCustomers should have many paymentMethods association', async () => {
        hasMany(CentsCustomer, 'paymentMethods');
    });

    it('centsCustomers should have creditHistory association', async () => {
        hasAssociation(CentsCustomer, 'creditHistory');
    });

    it('centsCustomers should have many creditHistory association', async () => {
        hasMany(CentsCustomer, 'creditHistory');
    });

    it('centsCustomers should have language association', async () => {
        hasAssociation(CentsCustomer, 'language');
    });

    it('centsCustomers should BelongsToOneRelation language association', async () => {
        belongsToOne(CentsCustomer, 'language');
    });

    it('centsCustomers should have businessCustomers association', async () => {
        hasAssociation(CentsCustomer, 'businessCustomers');
    });

    it('centsCustomers should have many businessCustomers association', async () => {
        hasMany(CentsCustomer, 'businessCustomers');
    });

    it('centsCustomers should have languageId from hook when insert without languageId', async () => {
        await factory.create(FN.language);
        const centsCustomers = await factory.create(FN.centsCustomer, {
            languageId: undefined,
        });
        expect(centsCustomers, 'languageId should be added').to.have.property('languageId');
        expect(centsCustomers.languageId, 'languageId should be 1 by default').to.equals(1);
    });

    it('centsCustomers should have languageId from hook when update without languageId', async () => {
        await factory.create(FN.language);
        const centsCustomers = await factory.create(FN.centsCustomer, {
            languageId: undefined,
        });
        const updatedCentsCustomers = await CentsCustomer.query()
            .update({ languageId: undefined })
            .findById(centsCustomers.id)
            .returning('*');
        expect(updatedCentsCustomers, 'languageId should be added').to.have.property('languageId');
        expect(updatedCentsCustomers.languageId, 'languageId should be 1 by default').to.equals(1);
    });
});
