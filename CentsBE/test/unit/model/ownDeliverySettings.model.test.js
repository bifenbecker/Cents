require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne, hasMany } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const OwnDeliverySettings = require('../../../models/ownDeliverySettings');

describe('test ownDeliverySettings model', () => {
    it('should return true if ownDeliverySettings table exists', async () => {
        const hasTableName = await hasTable(OwnDeliverySettings.tableName);
        expect(hasTableName).to.be.true;
    });

    it('ownDeliverySettings should have store association', async () => {
        hasAssociation(OwnDeliverySettings, 'store');
    });

    it('ownDeliverySettings should have BelongsToOneRelation store association', async () => {
        belongsToOne(OwnDeliverySettings, 'store');
    });

    describe('zones association', () => {
        it('ownDeliverySettings should have HasManyRelation zones association', async () => {
            hasMany(OwnDeliverySettings, 'zones');
        });

        it('filter deleted zones', async () => {
            const ownDeliverySettings = await factory.create('ownDeliverySetting');
            const zone1 = await factory.create('zone', {
                ownDeliverySettingsId: ownDeliverySettings.id,
            });
            const zone2 = await factory.create('zone', {
                ownDeliverySettingsId: ownDeliverySettings.id,
                deletedAt: new Date(),
            });
            const ownDeliverySettingsWithZones = await OwnDeliverySettings.query()
                .withGraphFetched('[zones]')
                .findById(ownDeliverySettings.id);
            expect(ownDeliverySettingsWithZones.zones.map(z => z.id)).to.eql([zone1.id]);
        });
    });

    it('ownDeliverySettings should have updatedAt field when updated for beforeUpdate hook', async () => {
        const ownDeliverySettings = await factory.create('ownDeliverySetting');
        const initialDeliverySettings = await OwnDeliverySettings.query()
            .findById(ownDeliverySettings.id)
            .returning('*');
        const updatedDeliverySettings = await OwnDeliverySettings.query()
            .patch({
                store: ownDeliverySettings.storeId,
            })
            .findById(ownDeliverySettings.id)
            .returning('*');

        expect(updatedDeliverySettings.updatedAt).to.not.be.null;
        expect(updatedDeliverySettings.updatedAt).to.not.be.undefined;
        expect(updatedDeliverySettings.updatedAt).to.be.a.dateString();
        expect(initialDeliverySettings.updatedAt.getTime()).to.not.equal(
            updatedDeliverySettings.updatedAt.getTime(),
        );
    });
});
