require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const getDuplicateInventoryOrder = require('../../../../../uow/order/inventoryOrder/getDuplicateInventoryOrder');
const { transaction } = require('objection');
const Model = require('../../../../../models');
const moment = require('moment');

describe('test getDuplicateInventoryOrder UOW', () => {
    let store, centsCustomer, storeCustomer, txn;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomer = await factory.create(FN.centsCustomer);
        storeCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: centsCustomer.id,
        });

        const fiveMinutesAgo = moment().subtract(5, 'minutes');
        await factory.create(FN.inventoryOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            createdAt: fiveMinutesAgo,
        });

        txn = await transaction.start(Model.knex());
    });

    it('should be undefined if there are no recent orders for store + customer', async () => {
        // arrange
        const payload = {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        };

        // act
        const res = await getDuplicateInventoryOrder(payload);

        // assert
        expect(res).to.be.undefined;
    });

    it('should return order if there is a duplicate', async () => {
        // arrange
        const originalOrder = await factory.create(FN.inventoryOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });

        const payload = {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        };

        // act
        const res = await getDuplicateInventoryOrder(payload);

        // assert
        expect(res).to.be.an('object');
        expect(res).to.have.property('id', originalOrder.id);
    });

    it('should succeed if there are no orders for store + customer', async () => {
        // arrange
        const differentCentsCustomer = await factory.create(FN.centsCustomer);

        const payload = {
            storeId: store.id,
            centsCustomerId: differentCentsCustomer.id,
        };

        // act
        const res = await getDuplicateInventoryOrder(payload);

        // assert
        expect(res).to.be.undefined;
    });
});
