require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const BusinessCustomerPreferences = require('./../../../models/businessCustomerPreferences');

describe('test BusinessCustomerPreferences model', () => {

    it('should return true if BusinessCustomerPreferences table exists', async () => {
        const hasTableName = await hasTable(BusinessCustomerPreferences.tableName)
        expect(hasTableName).to.be.true
    })

    it('BusinessCustomerPreferences should have business association', async () => {
        hasAssociation(BusinessCustomerPreferences, 'business')
    });

    it('BusinessCustomerPreferences should BelongsToOneRelation business association', async () => {
        belongsToOne(BusinessCustomerPreferences, 'business')
    });

    it('BusinessCustomerPreferences model should have updatedAt field when updated for beforeUpdate hook', async () => {
        const businessCustomerPreferences = await factory.create('businessCustomerPreferences');

        const updatedBusinessCustomerPreferences = await BusinessCustomerPreferences.query()
            .patch({
                fieldName: 'test',
            })
            .findById(businessCustomerPreferences.id)
            .returning('*');
        expect(updatedBusinessCustomerPreferences.updatedAt).to.not.be.null;
        expect(updatedBusinessCustomerPreferences.updatedAt).to.not.be.undefined;
        expect(updatedBusinessCustomerPreferences.updatedAt).to.be.a.dateString();
    });
});
