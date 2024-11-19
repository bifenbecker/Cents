require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
    hasMany,
} = require('../../support/objectionTestHelper');
const ServicesMaster = require('../../../models/services');

describe('servicesMaster model test', () => {
    it('should return true if servicesMaster table exists', async () => {
        const hasTableName = await hasTable(ServicesMaster.tableName);
        expect(hasTableName).to.be.true;
    });

    it('servicesMaster should have serviceCategory association', async () => {
        hasAssociation(ServicesMaster, 'serviceCategory');
    });

    it('servicesMaster should have BelongsToOneRelation serviceCategory association', async () => {
        belongsToOne(ServicesMaster, 'serviceCategory');
    });

    it('servicesMaster should have prices association', async () => {
        hasAssociation(ServicesMaster, 'prices');
    });

    it('servicesMaster should have HasManyRelation prices association', async () => {
        hasMany(ServicesMaster, 'prices');
    });

    it('servicesMaster should have serviceModifiers association', async () => {
        hasAssociation(ServicesMaster, 'serviceModifiers');
    });

    it('servicesMaster should have HasManyRelation serviceModifiers association', async () => {
        hasMany(ServicesMaster, 'serviceModifiers');
    });
});
