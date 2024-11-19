require('../../testHelper')
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper')
const OrderActivityLog = require('../../../models/orderActivityLog');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');
const factory = require('../../factories');

describe('test OrderActivityLog model', () => {

    it('should return true if OrderActivityLog table exists', async () => {
        const hasTableName = await hasTable(OrderActivityLog.tableName);
        expect(hasTableName).to.be.true;
    })

    it('OrderActivityLog should have order association', async () => {
        hasAssociation(OrderActivityLog, 'order');
    });

    it('OrderActivityLog should BelongsToOneRelation order association', async () => {
        belongsToOne(OrderActivityLog, 'order');
    });

    it('OrderActivityLog should update updatedAt field when it updated', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FACTORIES_NAMES.orderActivityLog,
            model: OrderActivityLog,
            patchPropName: 'status',
            patchPropValue: 'NOT_READY_FOR_PROCESSING'
        });
    });

    it('OrderActivityLog should have isAdjusted field false if notes not "Order Adjustment"', async () => {
        const orderActivityLog = await factory.create(FACTORIES_NAMES.orderActivityLog);
        const order = await OrderActivityLog.query()
            .findById(orderActivityLog.id)
            .returning('*');
        expect(order.notes).to.be.a.not.equal('Order Adjustment');
        expect(order.isAdjusted).to.be.a.not.null;
        expect(order.isAdjusted).to.be.a.not.undefined;
        expect(order.isAdjusted).to.be.a.false;
    });

    it('OrderActivityLog should have isAdjusted field true if notes is equal "Order Adjustment"', async () => {
        const orderActivityLog = await factory.create(FACTORIES_NAMES.orderActivityLog, { notes: 'Order Adjustment' });
        const order = await OrderActivityLog.query()
            .findById(orderActivityLog.id)
            .returning('*');
        expect(order.notes).to.be.a.equal('Order Adjustment');
        expect(order.isAdjusted).to.be.a.not.null;
        expect(order.isAdjusted).to.be.a.not.undefined;
        expect(order.isAdjusted).to.be.a.true;
    });

});
