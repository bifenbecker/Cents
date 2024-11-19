require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const PreferenceOptions = require('../../../models/preferenceOptions');

describe('test PreferenceOptions model', () => {

    it('should return true if PreferenceOptions table exists', async () => {
        const hasTableName = await hasTable(PreferenceOptions.tableName)
        expect(hasTableName).to.be.true
    })

    it('PreferenceOptions should have businessPreference association', async () => {
        hasAssociation(PreferenceOptions, 'businessPreference')
    });

    it('PreferenceOptions should BelongsToOneRelation businessPreference association', async () => {
        belongsToOne(PreferenceOptions, 'businessPreference')
    });

    it('PreferenceOptions model should have updatedAt field when updated for beforeUpdate hook', async () => {
        const preferenceOptions = await factory.create('preferenceOptions');
        const updatedPreferenceOptions = await PreferenceOptions.query()
            .patch({
                value: 'test',
            })
            .findById(preferenceOptions.id)
            .returning('*');
        expect(updatedPreferenceOptions.updatedAt).to.not.be.null;
        expect(updatedPreferenceOptions.updatedAt).to.not.be.undefined;
        expect(updatedPreferenceOptions.updatedAt).to.be.a.dateString();
    });
});
