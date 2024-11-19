require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasTable,
    hasMany,
    belongsToOne,
    hasAssociation,
} = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const District = require('../../../models/district');

describe('test District model', () => {
    it('should return true if district table exists', async () => {
        const hasTableName = await hasTable(District.tableName);
        expect(hasTableName).to.be.true;
    });

    it('should return true if district idColumn exists', async () => {
        const idColumn = District.idColumn;
        expect(idColumn).not.to.be.empty;
    });

    it('district should have stores association', () => {
        hasAssociation(District, 'stores');
    });

    it('district should have many stores association', async () => {
        hasMany(District, 'stores');
    });

    it('district should have region association', () => {
        hasAssociation(District, 'region');
    });

    it('district should belongs to one relation region association', async () => {
        belongsToOne(District, 'region');
    });

    it('district model should have getStores method when created', async () => {
        const district = await factory.create('district');
        expect(district.getStores).to.be.a('function');
    });

    it('district model getStores method should return store', async () => {
        const district = await factory.create('district');
        await factory.create('store', { districtId: district.id });
        expect((await district.getStores())[0].districtId).to.be.eq(district.id);
    });

    it('district model should have getRegion method when created', async () => {
        const district = await factory.create('district');
        expect(district.getRegion).to.be.a('function');
    });

    it('district model getRegion method should return region', async () => {
        const region = await factory.create('region');
        const district = await factory.create('district', {
            regionId: region.id,
        });
        expect((await district.getRegion()).id).to.be.eq(region.id);
    });
});
