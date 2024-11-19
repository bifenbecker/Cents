require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');
const PaymentMethod = require('../../../models/paymentMethod');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test paymentMethod model', () => {
    it('should return true if paymentMethod table exists', async () => {
        const hasTableName = await hasTable(PaymentMethod.tableName);
        expect(hasTableName).to.be.true;
    });

    it('paymentMethod should have centsCustomer association', async () => {
        hasAssociation(PaymentMethod, 'customer')
    });

    it('paymentMethod should BelongsToOneRelation centsCustomer association', async () => {
        belongsToOne(PaymentMethod, 'customer')
    });

    it('paymentMethod should have updatedAt field when updated for beforeUpdate hook', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FN.paymentMethod,
            factoryData: { id: 1 },
            model: PaymentMethod,
            patchPropName: 'provider',
            patchPropValue: 'provider',
        })
    });
});