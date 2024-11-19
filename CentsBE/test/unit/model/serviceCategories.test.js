require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, hasMany, belongsToOne } = require('../../support/objectionTestHelper')
const ServiceCategories = require('../../../models/serviceCategories');

describe('test ServiceCategories model', () => {

    it('should return true if ServiceCategories table exists', async () => {
        const hasTableName = await hasTable(ServiceCategories.tableName)
        expect(hasTableName).to.be.true
    });

    it('idColumn should return id', async () => {
        expect(ServiceCategories.idColumn).to.equal('id');
    });

    it('ServiceCategories should have business association', async () => {
        hasAssociation(ServiceCategories, 'business')
    });

    it('ServiceCategories should have belongsToOne business association', async () => {
        belongsToOne(ServiceCategories, 'business')
    });

    it('ServiceCategories should have services association', async () => {
        hasAssociation(ServiceCategories, 'services')
    });

    it('ServiceCategories should have HasManyRelation services association', async () => {
        hasMany(ServiceCategories, 'services')
    });

});
