require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasTable,
    hasAssociation,
    belongsToOne,
    hasMany,
    hasOneThrough,
} = require('../../support/objectionTestHelper');
const Batch = require('../../../models/batch');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');

describe('test batch model', () => {
    it('should return true if batches table exists', async () => {
        const hasTableName = await hasTable(Batch.tableName);
        expect(hasTableName).to.be.true;
    });

    it('batches should have devices association', () => {
        hasAssociation(Batch, 'devices');
    });

    it('batches should have many devices association', () => {
        hasMany(Batch, 'devices');
    });

    it('batches should have store association', () => {
        hasAssociation(Batch, 'store');
    });

    it('batches should BelongsToOneRelation store association', () => {
        belongsToOne(Batch, 'store');
    });

    it('batches should have business association', () => {
        hasAssociation(Batch, 'business');
    });

    it('batches should HasOneThroughRelation business association', () => {
        hasOneThrough(Batch, 'business');
    });

    it('batch model should return id column', () => {
        expect(Batch.idColumn).to.equal('id');
    });

    it('batch model should have getBusiness() method', async () => {
        const batch = await factory.create(FACTORIES_NAMES.batch);
        expect(batch.getBusiness).to.be.a('function');
    });
});
