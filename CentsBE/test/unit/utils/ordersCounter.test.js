require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');
const OrderCount = require('../../../models/businessOrderCount');
const { getOrderCount, updateOrderCount } = require('../../../utils/ordersCounter');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');

describe('ordersCounter test', function () {
    let business, orderCount;
    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        orderCount = await factory.create(FACTORIES_NAMES.businessOrderCount, {
            businessId: business.id,
        });
    });
    describe('getOrderCount func test', function () {
        it('should return correct number of totalOrders', async () => {
            const res = await getOrderCount(business.id);
            expect(res).equal(orderCount.totalOrders);
        });

        it('should return 0 if wrong businessId provided', async () => {
            const res = await getOrderCount(-12345);
            expect(res).equal(0);
        });
    });

    describe('updateOrderCount func test', function () {
        it('should successfully update totalOrders field', async () => {
            await updateOrderCount(business.id, orderCount.totalOrders);
            const item = await OrderCount.query().findOne({ businessId: business.id });
            expect(item.totalOrders).equal(orderCount.totalOrders + 1);
        });

        it('should not update totalOrders if wrong businessId provided', async () => {
            await updateOrderCount(-1234, orderCount.totalOrders);
            const item = await OrderCount.query().findOne({ businessId: business.id });
            expect(item.totalOrders).equal(orderCount.totalOrders);
        });
    });
});
