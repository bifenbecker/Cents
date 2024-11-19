require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const Payment = require('../../../models/payment');

describe('test Payment model', () => {
    it('should return true if payments table exists', async () => {
        const hasTableName = await hasTable(Payment.tableName);
        expect(hasTableName).to.be.true;
    });

    it('Payment should have store association', async () => {
        hasAssociation(Payment, 'store');
    });

    it('Payment should BelongsToOneRelation store association', async () => {
        belongsToOne(Payment, 'store');
    });

    it('Payment should have orders association', async () => {
        hasAssociation(Payment, 'orders');
    });

    it('Payment should BelongsToOneRelation orders association', async () => {
        belongsToOne(Payment, 'orders');
    });

    it('Payment should have customer association', async () => {
        hasAssociation(Payment, 'customer');
    });

    it('Payment should BelongsToOneRelation customer association', async () => {
        belongsToOne(Payment, 'customer');
    });

    it('Payment should have paymentRefunds association', async () => {
        hasAssociation(Payment, 'paymentRefunds');
    });

    it('Payment should BelongsToOneRelation paymentRefunds association', async () => {
        hasMany(Payment, 'paymentRefunds');
    });
});
