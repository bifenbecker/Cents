require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');
const factory = require('../../factories');

describe('test getOrderCodePrefix', () => {
    it('should return order code prefix if case is residential', async () => {
        const order = await factory.create('serviceOrder', {
            orderType: 'RESIDENTIAL',
            orderCode: '13',
        });
        expect(getOrderCodePrefix(order)).to.eq(`RWF-${order.orderCode}`);
    });

    it('should return order code prefix if case is service', async () => {
        const order = await factory.create('serviceOrder', {
            orderType: 'SERVICE',
            orderCode: '13',
        });
        expect(getOrderCodePrefix(order)).to.eq(`WF-${order.orderCode}`);
    });

    it('should return order code prefix if case is online', async () => {
        const order = await factory.create('serviceOrder', {
            orderType: 'ONLINE',
            orderCode: '13',
        });
        expect(getOrderCodePrefix(order)).to.eq(`DWF-${order.orderCode}`);
    });

    it('should return order code prefix if case is inventory', async () => {
        const inventoryOrder = await factory.create('inventoryOrder', {
            orderCode: '13',
        });
        const order = {
            orderCode: inventoryOrder.orderCode,
            orderType: 'INVENTORY',
        };
        expect(getOrderCodePrefix(order)).to.eq(`INV-${order.orderCode}`);
    });

    it('should return order code prefix if case is default', async () => {
        const inventoryOrder = await factory.create('inventoryOrder', {
            orderCode: '13',
        });
        const order = {
            orderCode: inventoryOrder.orderCode,
            orderType: 'DEFAULT',
        };
        expect(getOrderCodePrefix(order)).to.eq(`WF-${order.orderCode}`);
    });
});