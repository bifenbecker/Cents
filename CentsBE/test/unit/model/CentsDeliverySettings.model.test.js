require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const CentsDeliverySettings = require('../../../models/centsDeliverySettings');
const factory = require('../../factories');

describe('test centsDeliverySettings model', () => {
    it('should return true if centsDeliverySettings table exists', async () => {
        const hasTableName = await hasTable(CentsDeliverySettings.tableName);
        expect(hasTableName).to.be.true;
    });

    it('CentsDeliverySettings should have store association', () => {
        hasAssociation(CentsDeliverySettings, 'store');
    });

    it('CentsDeliverySettings should have BelongsToOneRelation store association', async () => {
        belongsToOne(CentsDeliverySettings, 'store');
    });

    it('CentsDeliverySettings should have updatedAt field when updated for beforeUpdate hook', async () => {
        const centsDeliverySettings = await factory.create('centsDeliverySettings');
        const initialCentsDeliverySettings = await CentsDeliverySettings.query().findById(centsDeliverySettings.id).returning('*');
        const updatedCentsDeliverySettings = await CentsDeliverySettings.query()
            .patch({
                store: centsDeliverySettings.storeId,
            })
            .findById(centsDeliverySettings.id)
            .returning('*');
        expect(updatedCentsDeliverySettings.updatedAt).to.not.be.null;
        expect(updatedCentsDeliverySettings.updatedAt).to.not.be.undefined;
        expect(updatedCentsDeliverySettings.updatedAt).to.be.a.dateString();
        expect(initialCentsDeliverySettings.updatedAt.getTime()).to.not.equal(
            updatedCentsDeliverySettings.updatedAt.getTime(),
        );
    });
});
