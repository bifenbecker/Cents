require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const CustomerPreferencesOptionSelection = require('../../../models/customerPreferencesOptionSelection');

describe('test CustomerPreferencesOptionSelection model', () => {
    it('should return true if CustomerPreferencesOptionSelection table exists', async () => {
        const hasTableName = await hasTable(CustomerPreferencesOptionSelection.tableName);
        expect(hasTableName).to.be.true;
    });

    it('CustomerPreferencesOptionSelection should have preferenceOption association', async () => {
        hasAssociation(CustomerPreferencesOptionSelection, 'preferenceOption');
    });

    it('CustomerPreferencesOptionSelection should BelongsToOneRelation preferenceOption association', async () => {
        belongsToOne(CustomerPreferencesOptionSelection, 'preferenceOption');
    });

    it('CustomerPreferencesOptionSelection should have centsCustomer association', async () => {
        hasAssociation(CustomerPreferencesOptionSelection, 'centsCustomer');
    });

    it('CustomerPreferencesOptionSelection should BelongsToOneRelation centsCustomer association', async () => {
        belongsToOne(CustomerPreferencesOptionSelection, 'centsCustomer');
    });

    it('CustomerPreferencesOptionSelection should have updatedAt field when updated for beforeUpdate hook', async () => {
        const customerPreferencesOptionSelection = await factory.create('customerPreferencesOptionSelection');
        const initialCustomerPreferences = await CustomerPreferencesOptionSelection.query()
            .findById(customerPreferencesOptionSelection.id)
            .returning('*');
        const updatedCustomerPreferences = await CustomerPreferencesOptionSelection.query()
            .patch({
                isDeleted: true,
            })
            .findById(initialCustomerPreferences.id)
            .returning('*');
        expect(Date.parse(updatedCustomerPreferences.updatedAt)).to.not.be.NaN;
        expect(initialCustomerPreferences.updatedAt.getTime()).to.not.equal(
            updatedCustomerPreferences.updatedAt.getTime(),
        );
    });
});