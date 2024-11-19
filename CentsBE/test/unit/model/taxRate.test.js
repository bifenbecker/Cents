require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasMany, hasAssociation } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const TaxRate = require('../../../models/taxRate');

describe('test TaxRate model', () => {
    it('should return true if taxRate table exists', async () => {
        const hasTableName = await hasTable(TaxRate.tableName);
        expect(hasTableName).to.be.true;
    });

    it('should return true if taxRate idColumn exists', async () => {
        const idColumn = TaxRate.idColumn;
        expect(idColumn).not.to.be.empty;
    });

    it('taxRate should have stores association', () => {
        hasAssociation(TaxRate, 'stores');
    });

    it('taxRate should have many stores association', async () => {
        hasMany(TaxRate, 'stores');
    });

    it('taxRate model should have getStores method when created', async () => {
        const taxRate = await factory.create('taxRate');
        expect(taxRate.getStores).to.be.a('function');
    });

    it('taxRate model getStores method should return store', async () => {
        const taxRate = await factory.create('taxRate');
        await factory.create('store', { taxRateId: taxRate.id });
        expect((await taxRate.getStores())[0].taxRateId).to.be.eq(taxRate.id);
    });
});
