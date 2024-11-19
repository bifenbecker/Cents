require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable } = require('../../support/objectionTestHelper');
const TipSetting = require('../../../models/tipSettings');

describe('test TipSetting model', () => {
    it('should return true if tipSetting table exists', async () => {
        const hasTableName = await hasTable(TipSetting.tableName);
        expect(hasTableName).to.be.true;
    });
});
