require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const ServicePrices = require('../../../models/servicePrices');
const factory = require('../../factories');

describe('test ServicePrices model', () => {
    it('should return true if ServicePrices table exists', async () => {
        const hasTableName = await hasTable(ServicePrices.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(ServicePrices.idColumn).to.equal('id');
    });

    it('ServicePrices should have service association', async () => {
        hasAssociation(ServicePrices, 'service');
    });

    it('ServicePrices should have BelongsToOneRelation service association', async () => {
        belongsToOne(ServicePrices, 'service');
    });

    it('ServicePrices should have store association', async () => {
        hasAssociation(ServicePrices, 'store');
    });

    it('ServicePrices should have BelongsToOneRelation store association', async () => {
        belongsToOne(ServicePrices, 'store');
    });

    it('ServicePrices should have pricingTier association', async () => {
        hasAssociation(ServicePrices, 'pricingTier');
    });

    it('ServicePrices should have BelongsToOneRelation pricingTier association', async () => {
        belongsToOne(ServicePrices, 'pricingTier');
    });

    it('ServicePrices model should have updatedAt field when updated for beforeUpdate hook', async () => {
        const servicePrice = await factory.create('servicePrice');
        const updatedServicePrice = await ServicePrices.query()
            .patch({
                minPrice: 10,
            })
            .findById(servicePrice.id)
            .returning('*');
        expect(updatedServicePrice.updatedAt).to.not.be.null;
        expect(updatedServicePrice.updatedAt).to.not.be.undefined;
        expect(updatedServicePrice.updatedAt).to.be.a.dateString();
    });
});
