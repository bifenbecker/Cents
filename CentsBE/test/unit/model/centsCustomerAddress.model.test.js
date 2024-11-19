require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const CentsCustomerAddress = require('../../../models/centsCustomerAddress');
const factory = require('../../factories');

describe('test CentsCustomerAddress model', () => {

    it('should return true if CentsCustomerAddress table exists', async () => {
        const hasTableName = await hasTable(CentsCustomerAddress.tableName);
        expect(hasTableName).to.be.true;
    });

    it('CentsCustomerAddress should have customer association', async () => {
        hasAssociation(CentsCustomerAddress, 'customer');
    });

    it('CentsCustomerAddress should BelongsToOneRelation customer association', async () => {
        belongsToOne(CentsCustomerAddress, 'customer');
    });

    it('CentsCustomerAddress should have updatedAt field when updated for beforeUpdate hook', async () => {
        const centsCustomerAddress = await factory.create('centsCustomerAddress');
        const updatedCentsCustomerAddress = await CentsCustomerAddress.query()
            .patch({
                postalCode: 123456
            })
            .findById(centsCustomerAddress.id)
            .returning('*');

        expect(updatedCentsCustomerAddress.updatedAt).to.not.be.null;
        expect(updatedCentsCustomerAddress.updatedAt).to.not.be.undefined;
        expect(updatedCentsCustomerAddress.updatedAt).to.be.a.dateString();
    });

});
