require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasOneThrough, hasTable, hasOne} = require('../../support/objectionTestHelper')
const factory = require('../../factories');
const EsdReader = require('../../../models/esdReader');

describe('test EsdReader model', () => {

    it('should return true if EsdReader table exists', async () => {
        const hasTableName = await hasTable(EsdReader.tableName)
        expect(hasTableName).to.be.true;
    })

    it('EsdReader should have HasOneThrough relation to business', async () => {
        hasOneThrough(EsdReader, 'business');
    });

    it('EsdReader should have BelongsToOneRelation to store', async () => {
        hasOne(EsdReader, 'store');
    });

    it('EsdReader model should have createdAt field when created for beforeInsert hook', async () => {
        const esdReader = await factory.create('esdReader');
        expect(esdReader.createdAt).to.not.be.null;
        expect(esdReader.createdAt).to.not.be.undefined;
        expect(esdReader.createdAt).to.be.a.dateString();
    });

    it('EsdReader model should have updatedAt field when updated for beforeUpdate hook', async () => {
        const esdReader = await factory.create('esdReader');
        const updatedEsdReader = await EsdReader.query()
            .patch({
                deviceSerialNumber: 123456,
            })
            .findById(esdReader.id)
            .returning('*');
        expect(updatedEsdReader.updatedAt).to.not.be.null;
        expect(updatedEsdReader.updatedAt).to.not.be.undefined;
        expect(updatedEsdReader.updatedAt).to.be.a.dateString();
    });
});
