require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, hasMany, belongsToOne } = require('../../support/objectionTestHelper')
const PricingTier = require('../../../models/pricingTier');

describe('test PricingTier model', () => {

    it('should return true if pricingTier table exists', async () => {
        const hasTableName = await hasTable(PricingTier.tableName)
        expect(hasTableName).to.be.true
    });

    it('PricingTier should have business association', async () => {
        hasAssociation(PricingTier, 'business')
    });

    it('PricingTier should have BelongsToOneRelation business association', async () => {
        belongsToOne(PricingTier, 'business')
    });

    it('PricingTier should have businessCustomers association', async () => {
        hasAssociation(PricingTier, 'businessCustomers')
    });

    it('businessCustomers should have HasManyRelation businessCustomers association', async () => {
        hasMany(PricingTier, 'businessCustomers')
    });

    it('PricingTier should have serviceOrders association', async () => {
        hasAssociation(PricingTier, 'serviceOrders')
    });

    it('businessCustomers should have HasManyRelation serviceOrders association', async () => {
        hasMany(PricingTier, 'serviceOrders')
    });

    it('PricingTier should have zones association', async () => {
        hasAssociation(PricingTier, 'zones')
    });

    it('businessCustomers should have HasManyRelation zones association', async () => {
        hasMany(PricingTier, 'zones')
    });

    it('PricingTier should have servicePrices association', async () => {
        hasAssociation(PricingTier, 'servicePrices')
    });

    it('businessCustomers should have HasManyRelation servicePrices association', async () => {
        hasMany(PricingTier, 'servicePrices')
    });

    it('PricingTier should have inventoryItems association', async () => {
        hasAssociation(PricingTier, 'inventoryItems')
    });

    it('businessCustomers should have HasManyRelation inventoryItems association', async () => {
        hasMany(PricingTier, 'inventoryItems')
    });

    it('PricingTier should have storeSettings association', async () => {
        hasAssociation(PricingTier, 'storeSettings')
    });

    it('businessCustomers should have HasManyRelation storeSettings association', async () => {
        hasMany(PricingTier, 'storeSettings')
    });

});
