require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, hasMany, belongsToOne } = require('../../support/objectionTestHelper')
const ServicesMaster = require('../../../models/services');

describe('test ServicesMaster model', () => {

    it('should return true if ServicesMaster table exists', async () => {
        const hasTableName = await hasTable(ServicesMaster.tableName)
        expect(hasTableName).to.be.true
    });

    it('ServicesMaster should have serviceCategory association', async () => {
        hasAssociation(ServicesMaster, 'serviceCategory')
    });

    it('ServicesMaster should have belongsToOne serviceCategory association', async () => {
        belongsToOne(ServicesMaster, 'serviceCategory')
    });

    it('ServicesMaster should have prices association', async () => {
        hasAssociation(ServicesMaster, 'prices')
    });

    it('ServicesMaster should have HasManyRelation prices association', async () => {
        hasMany(ServicesMaster, 'prices')
    });

    it('ServicesMaster should have serviceModifiers association', async () => {
        hasAssociation(ServicesMaster, 'serviceModifiers')
    });

    it('ServicesMaster should have HasManyRelation serviceModifiers association', async () => {
        hasMany(ServicesMaster, 'serviceModifiers')
    });

});
