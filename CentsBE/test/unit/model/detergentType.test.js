require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasTable } = require('../../support/objectionTestHelper')
const DetergentType = require('../../../models/detergentType')

describe('test DetergentType model', () => {

    it('should return true if DetergentType table exists', async () => {
        const hasTableName = await hasTable(DetergentType.tableName)
        expect(hasTableName).to.be.true
    });
})
