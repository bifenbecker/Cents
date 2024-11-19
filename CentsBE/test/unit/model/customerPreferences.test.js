require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const CustomerPreferences = require('./../../../models/customerPreferences');


describe('test CustomerPreferences model', () => {

    it('should return true if CustomerPreferences table exists', async () => {
        const hasTableName = await hasTable(CustomerPreferences.tableName)
        expect(hasTableName).to.be.true
    })

    it('CustomerPreferences should have preferenceOption association', async () => {
        hasAssociation(CustomerPreferences, 'preferenceOption')
    });

    it('CustomerPreferences should BelongsToOneRelation preferenceOption association', async () => {
        belongsToOne(CustomerPreferences, 'preferenceOption')
    });

    it('CustomerPreferences should have business association', async () => {
        hasAssociation(CustomerPreferences, 'business')
    });

    it('CustomerPreferences should BelongsToOneRelation business association', async () => {
        belongsToOne(CustomerPreferences, 'business')
    });

    it('CustomerPreferences should have customer association', async () => {
        hasAssociation(CustomerPreferences, 'customer')
    });

    it('CustomerPreferences should BelongsToOneRelation customer association', async () => {
        belongsToOne(CustomerPreferences, 'customer')
    });

    it('CustomerPreferences should have updatedAt field when created', async () => {
        const customerPreferences = await factory.build('customerPreferences');
        expect(customerPreferences.$beforeUpdate()).to.not.equal(null);
        expect(customerPreferences.$beforeUpdate()).to.not.equal(null);
    });
});
