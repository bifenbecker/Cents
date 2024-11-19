require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasTable } = require('../../support/objectionTestHelper')
const Language = require('../../../models/language');

describe('test Language model', () => {

    it('should return true if Language table exists', async () => {
        const hasTableName = await hasTable(Language.tableName)
        expect(hasTableName).to.be.true
    });

})