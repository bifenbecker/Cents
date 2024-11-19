require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const {
    hasAssociation,
    hasTable,
    belongsToOne,
    hasMany,
    hasOne,
} = require('../../support/objectionTestHelper')
const Order = require('../../../models/orders');
const factory = require('../../factories');

describe('test Order model', () => {
    it('should return true if order table exists', async () => {
        const hasTableName = await hasTable(Order.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(Order.idColumn).to.equal('id');
    });

    it('should return undefined orderableType', async () => {
        const serviceOrder = await factory.create('serviceOrder');
        const inventoryOrder = await factory.create('inventoryOrder');
        const order = await factory.create('order', {
            orderableType: false,
            orderableId: serviceOrder.id,
        });
        expect(order.getOrderable()).to.equal(undefined);
        expect(order.getOrderableModelClass()).to.equal(undefined);
    });

    it('should return OrderableModel successfully', async () => {
        const serviceOrder = await factory.create('serviceOrder');
        const inventoryOrder = await factory.create('inventoryOrder');
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        expect(order.getOrderable()).to.not.equal(null);
        expect(order.getOrderable()).to.not.equal(undefined);

        expect(order.getOrderableModelClass()).to.not.equal(null);
        expect(order.getOrderableModelClass()).to.not.equal(undefined);
    });

    it('Order should have store association', () => {
        hasAssociation(Order, 'store');
    });

    it('Order should BelongsToOneRelation store association', async () => {
        belongsToOne(Order, 'store');
    });

    it('Order should have payments association', async () => {
        hasAssociation(Order, 'payments');
    });

    it('Order should have many payments association', async () => {
        hasMany(Order, 'payments');
    });

    it('Order should have promotionDetails association', async () => {
        hasAssociation(Order, 'promotionDetails');
    });

    it('Order should have one promotionDetails association', async () => {
        hasOne(Order, 'promotionDetails');
    });

    it('Order should have delivery association', async () => {
        hasAssociation(Order, 'delivery');
    });

    it('Order should have one delivery association', async () => {
        hasOne(Order, 'delivery');
    });

    it('Order should have allPickup association', async () => {
        hasAssociation(Order, 'allPickup');
    });

    it('Order should have one allPickup association', async () => {
        hasOne(Order, 'allPickup');
    });

    it('Order should have pickup association', async () => {
        hasAssociation(Order, 'pickup');
    });

    it('Order should have one pickup association', async () => {
        hasOne(Order, 'pickup');
    });

    it('Order should have serviceOrder association', async () => {
        hasAssociation(Order, 'serviceOrder');
    });

    it('Order should have one serviceOrder association', async () => {
        hasOne(Order, 'serviceOrder');
    });

    it('Order should have machineOrders association', async () => {
        hasAssociation(Order, 'machineOrders');
    });

    it('Order should BelongsToOneRelation machineOrders association', async () => {
        belongsToOne(Order, 'machineOrders');
    });

});