require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation,
        hasTable,
        belongsToOne,
        hasMany,
} = require('../../support/objectionTestHelper');
const Region = require('../../../models/region');
const factory = require('../../factories');

describe('test Region model', () => {
    it('should return true if regions table exists', async () => {
        const hasTableName = await hasTable(Region.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(Region.idColumn).to.equal('id');
    });

    it('Region should have districts association', () => {
        hasAssociation(Region, 'districts');
    });

    it('Region should have many districts association', async () => {
        hasMany(Region, 'districts');
    });

    it('Region should have business association', () => {
        hasAssociation(Region, 'business');
    });

    it('Region should BelongsToOneRelation business association', async () => {
        belongsToOne(Region, 'business');
    });

    it('Region model should have getDistricts method when created', async () => {
        const region = await factory.create('region');
        expect(region.getDistricts).to.be.a('function');
    });

    it('Region model getDistricts method should return districts', async () => {
        const region = await factory.create('region'),
            district = await factory.create('district', {
                regionId: region.id,
            });
        expect((await region.getDistricts())[0].id).to.be.eq(district.id);
    });

    it('Region model should have getBusiness method when created', async () => {
        const region = await factory.create('region');
        expect(region.getBusiness).to.be.a('function');
    });

    it('Region model getBusiness method should return business', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness'),
            region = await factory.create('region', {
                businessId: laundromatBusiness.id,
            });
        expect((await region.getBusiness()).id).to.be.eq(laundromatBusiness.id);
    });
});
