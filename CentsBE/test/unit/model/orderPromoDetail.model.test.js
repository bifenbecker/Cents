require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation,
        hasTable,
        belongsToOne,
} = require('../../support/objectionTestHelper');
const OrderPromoDetail = require('../../../models/orderPromoDetail');

describe('test OrderPromoDetail model', () => {
    it('should return true if orderPromoDetails table exists', async () => {
        const hasTableName = await hasTable(OrderPromoDetail.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(OrderPromoDetail.idColumn).to.equal('id');
    });

    it('OrderPromoDetail should have order association', () => {
        hasAssociation(OrderPromoDetail, 'order');
    });

    it('OrderPromoDetail should belongsToOne order association', async () => {
        belongsToOne(OrderPromoDetail, 'order');
    });
});
