require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, hasMany } = require('../../support/objectionTestHelper')
const WashService = require('../../../models/washService');

describe('test WashService model', () => {

    it('should return true if WashService table exists', async () => {
        const hasTableName = await hasTable(WashService.tableName)
        expect(hasTableName).to.be.true
    });

    it('WashService should have prices association', async () => {
        hasAssociation(WashService, 'prices')
    });

    it('WashService should have HasManyRelation prices association', async () => {
        hasMany(WashService, 'prices')
    });

});
