require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne, hasMany } = require('../../support/objectionTestHelper')
const BusinessCustomer = require('../../../models/businessCustomer');

describe('test BusinessCustomer model', () => {

    it('should return true if BusinessCustomer table exists', async () => {
        const hasTableName = await hasTable(BusinessCustomer.tableName)
        expect(hasTableName).to.be.true
    })

    it('BusinessCustomer should have centsCustomer association', async () => {
        hasAssociation(BusinessCustomer, 'centsCustomer')
    });

    it('BusinessCustomer should BelongsToOneRelation centsCustomer association', async () => {
        belongsToOne(BusinessCustomer, 'centsCustomer')
    });

    it('BusinessCustomer should have commercialTier association', async () => {
        hasAssociation(BusinessCustomer, 'commercialTier')
    });

    it('BusinessCustomer should BelongsToOneRelation commercialTier association', async () => {
        belongsToOne(BusinessCustomer, 'commercialTier')
    });

    it('BusinessCustomer should have business association', async () => {
        hasAssociation(BusinessCustomer, 'business')
    });

    it('BusinessCustomer should BelongsToOneRelation business association', async () => {
        belongsToOne(BusinessCustomer, 'business')
    });

    it('BusinessCustomer should have storeCustomers association', async () => {
        hasAssociation(BusinessCustomer, 'storeCustomers')
    });

    it('BusinessCustomer should have HasMany storeCustomers association', async () => {
        hasMany(BusinessCustomer, 'storeCustomers')
    });

});
