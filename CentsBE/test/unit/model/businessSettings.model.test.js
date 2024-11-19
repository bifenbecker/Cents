require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable } = require('../../support/objectionTestHelper');
const BusinessSettings = require('../../../models/businessSettings');

describe('test BusinessSettings model', () => {
    it('should return true if businessSettings table exists', async () => {
        const hasTableName = await hasTable(BusinessSettings.tableName);
        expect(hasTableName).to.be.true;
    });
});
