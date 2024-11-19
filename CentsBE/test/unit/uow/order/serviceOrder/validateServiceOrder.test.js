require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const validateServiceOrder = require('../../../../../uow/order/serviceOrder/validateServiceOrder');
const { transaction } = require('objection');
const Model = require('../../../../../models');
const moment = require('moment');

describe('test validateServiceOrder UOW', () => {
    let store, centsCustomer, storeCustomer, txn;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomer = await factory.create(FN.centsCustomer);
        storeCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: centsCustomer.id,
        });

        const fiveMinutesAgo = moment().subtract(5, 'minutes');
        await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            createdAt: fiveMinutesAgo,
        });

        txn = await transaction.start(Model.knex());
    });

    it('should succeed if there are no recent orders for store + customer', async () => {
        // arrange
        const payload = {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        };

        // act
        const res = await validateServiceOrder(payload);

        // assert
        expect(res).to.be.true;
    });

    it('should throw error if there are recent duplicate orders', async () => {
        // arrange
        await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });

        const payload = {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        };

        // act
        const res = await validateServiceOrder(payload);

        // assert
        expect(res).to.be.false;
    });

    it('should succeed if there are no orders for store + customer', async () => {
        // arrange
        const differentCentsCustomer = await factory.create(FN.centsCustomer);
        const differentStoreCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: differentCentsCustomer.id,
        });
        const payload = {
            storeId: store.id,
            centsCustomerId: differentCentsCustomer.id,
        };

        // act
        const res = await validateServiceOrder(payload);

        // assert
        expect(res).to.be.true;
    });
});
