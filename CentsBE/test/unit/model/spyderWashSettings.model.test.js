require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasOneThrough, hasTable, belongsToOne } = require('../../support/objectionTestHelper')
const factory = require('../../factories');
const SpyderWashSettings = require('../../../models/spyderWashSettings');

describe('test SpyderWashSettings model', () => {

    it('should return true if SpyderWashSettings table exists', async () => {
        const hasTableName = await hasTable(SpyderWashSettings.tableName)
        expect(hasTableName).to.be.true;
    })

    it('SpyderWashSettings should have HasOneThrough relation to business', async () => {
        hasOneThrough(SpyderWashSettings, 'business');
    });

    it('SpyderWashSettings should have BelongsToOneRelation to store', async () => {
        belongsToOne(SpyderWashSettings, 'store');
    });

    it('SpyderWashSettings model should have createdAt field when created', async () => {
        const spyderWashSettings = await factory.create('spyderWashSettings');
        expect(spyderWashSettings.createdAt).to.not.be.null;
    });

    it('SpyderWashSettings model should have updatedAt field when created', async () => {
        const spyderWashSettings = await factory.create('spyderWashSettings');
        expect(spyderWashSettings.updatedAt).to.not.be.null;
    });
});
