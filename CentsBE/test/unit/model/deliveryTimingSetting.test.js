require('../../testHelper');
const { expect, assert } = require('../../support/chaiHelper');
const { hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const DeliveryTimingSettings = require('../../../models/deliveryTimingSettings');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test deliveryTimingSettings model', () => {
    it('should return true if deliveryTimingSettings table exists', async () => {
        const hasTableName = await hasTable(DeliveryTimingSettings.tableName);
        expect(hasTableName).to.be.true;
    });

    it('deliveryTimingSettings should BelongsToOneRelation timings association', async () => {
        belongsToOne(DeliveryTimingSettings, 'timing');
    });

    it('DeliveryTimingSettings.getTiming() should return timings', async () => {
        const timing = await factory.create(FN.timing, {
            startTime: '2021-09-21T19:19:58.000Z',
            endTime: '2021-09-21T20:19:58.000Z',
        });
        const deliveryTimingSettings = await factory.create(FN.deliveryTimingSetting, {
            timingsId: timing.id,
        });

        const result = await deliveryTimingSettings.getTiming();

        expect(result).to.be.an('object');
        assert.deepOwnInclude(JSON.parse(JSON.stringify(result)), timing);
    });
});
