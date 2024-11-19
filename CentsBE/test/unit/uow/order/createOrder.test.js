require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const createOrder = require('../../../../uow/order/createOrder');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

describe('test createOrder UoW', () => {
    describe('should return valid payload', () => {
        let entities;

        beforeEach(async () => {
            entities = await createUserWithBusinessAndCustomerOrders({
                createBusinessPromotionPrograms: true,
            });
        });

        it('with ServiceOrder', async () => {
            const { serviceOrder, store } = entities;

            // call Uow
            const newPayload = await createOrder({
                store,
                serviceOrder,
                orderType: 'ServiceOrder',
            });

            // assert
            expect(newPayload.order).to.have.property('storeId', store.id);
            expect(newPayload.order).to.have.property('orderableId', serviceOrder.id);
            expect(newPayload.order).to.have.property('orderableType', 'ServiceOrder');
        });

        it('with InventoryOrder', async () => {
            const { store, user, storeCustomer } = entities;
            const inventoryOrder = await factory.create(FN.inventoryOrder, {
                customerId: user.id,
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
            });

            // call Uow
            const newPayload = await createOrder({
                store,
                inventoryOrder,
                orderType: 'InventoryOrder',
            });

            // assert
            expect(newPayload.order).to.have.property('storeId', store.id);
            expect(newPayload.order).to.have.property('orderableId', inventoryOrder.id);
            expect(newPayload.order).to.have.property('orderableType', 'InventoryOrder');
        });
    });

    it('should throw Error with invalid payload', async () => {
        await expect(
            createOrder({
                storeId: MAX_DB_INTEGER,
            }),
        ).to.be.rejected;
    });
});
