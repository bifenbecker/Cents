require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const ShiftTimingZone = require('../../../models/shiftTimingZone');

describe('test shiftTimingZone model', () => {
    it('should return true if shiftTimingZone table exists', async () => {
        const hasTableName = await hasTable(ShiftTimingZone.tableName);
        expect(hasTableName).to.be.true;
    });

    it('shiftTimingZone should BelongsToOneRelation timings association', async () => {
        belongsToOne(ShiftTimingZone, 'timings');
    });
});
