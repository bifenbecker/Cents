require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation,
        hasTable,
        hasOneThrough,
        hasOne,
} = require('../../support/objectionTestHelper');
const CciSetting = require('../../../models/cciSetting');
const factory = require('../../factories');

describe('test CciSetting model', () => {
    it('should return true if cciSettings table exists', async () => {
        const hasTableName = await hasTable(CciSetting.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(CciSetting.idColumn).to.equal('id');
    });

    it('CciSetting should have business association', () => {
        hasAssociation(CciSetting, 'business');
    });

    it('CciSetting should HasOneThrough business association', async () => {
        hasOneThrough(CciSetting, 'business');
    });

    it('CciSetting should have store association', () => {
        hasAssociation(CciSetting, 'store');
    });

    it('CciSetting should HasOne store association', async () => {
        hasOne(CciSetting, 'store');
    });

    it('CciSetting model should have updatedAt field when updated for beforeUpdate hook', async () => {
        const cciSetting = await factory.create('cciSetting');
        const updatedUsername = await CciSetting.query()
            .patch({
                username: 'user123'
            })
            .findById(cciSetting.id)
            .returning('*');
        expect(updatedUsername.updatedAt).to.not.be.null;
        expect(updatedUsername.updatedAt).to.not.be.undefined;
    });
});
