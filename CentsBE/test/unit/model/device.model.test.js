require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const Device = require('../../../models/device');

describe('device model test', () => {
    it('should return true if devices table exsists', async () => {
        const hasTableName = await hasTable(Device.tableName);
        expect(hasTableName).to.be.true;
    });

    it('device should have pairing association', function () {
        hasAssociation(Device, 'pairing');
    });

    it('device should have many pairing association', function () {
        hasMany(Device, 'pairing');
    });

    it('device should have BelongsToOneRelation batch association', function () {
        belongsToOne(Device, 'batch');
    });

    it('device should have turns association', function () {
        hasAssociation(Device, 'turns');
    });

    it('device should have many turns association', function () {
        hasMany(Device, 'turns');
    });
});
