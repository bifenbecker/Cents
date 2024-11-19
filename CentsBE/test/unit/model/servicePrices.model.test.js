require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, belongsToOne, hasAssociation } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const ServicePrices = require('../../../models/servicePrices');

describe('test ServicePrices model', () => {
    it('should return true if servicePrices table exists', async () => {
        const hasTableName = await hasTable(ServicePrices.tableName);
        expect(hasTableName).to.be.true;
    });

    it('should return true if servicePrices idColumn exists', async () => {
        const idColumn = await ServicePrices.idColumn;
        expect(idColumn).not.to.be.empty;
    });

    it('servicePrices should have service association', () => {
        hasAssociation(ServicePrices, 'service');
    });

    it('servicePrices should belongs to one relation service association', async () => {
        belongsToOne(ServicePrices, 'service');
    });

    it('servicePrices should have store association', () => {
        hasAssociation(ServicePrices, 'store');
    });

    it('servicePrices should belongs to one relation store association', async () => {
        belongsToOne(ServicePrices, 'store');
    });

    it('servicePrices should have pricingTier association', () => {
        hasAssociation(ServicePrices, 'pricingTier');
    });

    it('servicePrices should belongs to one relation pricingTier association', async () => {
        belongsToOne(ServicePrices, 'pricingTier');
    });

    it('servicePrices should have updatedAt field when updated for beforeUpdate hook', async () => {
        const servicePrice = await factory.create('servicePrice');
        const updatedServicePrice = await ServicePrices.query()
            .patch({
                storePrice: 2,
            })
            .findById(servicePrice.id)
            .returning('*');
        expect(updatedServicePrice.updatedAt).to.not.be.null;
        expect(updatedServicePrice.updatedAt).to.not.be.undefined;
        expect(updatedServicePrice.updatedAt).to.be.a.dateString();
    });
});
