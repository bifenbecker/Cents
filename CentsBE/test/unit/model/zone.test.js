require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const Zone = require('../../../models/zone');

describe('test zone model', () => {
    it('should return true if zone table exists', async () => {
        const hasTableName = await hasTable(Zone.tableName);
        expect(hasTableName).to.be.true;
    });

    it('zone should have ownDeliverySettings association', async () => {
        hasAssociation(Zone, 'ownDeliverySettings');
    });

    it('zone should BelongsToOneRelation ownDeliverySettings association', async () => {
        belongsToOne(Zone, 'ownDeliverySettings');
    });

    it('zone should have deliveryTier association', async () => {
        hasAssociation(Zone, 'deliveryTier');
    });

    it('zone should BelongsToOneRelation deliveryTier association', async () => {
        belongsToOne(Zone, 'deliveryTier');
    });
});
