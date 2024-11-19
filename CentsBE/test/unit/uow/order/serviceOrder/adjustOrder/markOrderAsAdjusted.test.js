require('../../../../../testHelper');
const { transaction } = require('objection');
const ServiceOrder = require('../../../../../../models/serviceOrders');
const Model = require('../../../../../../models');
const markOrderAsAdjusted = require('../../../../../../uow/order/serviceOrder/adjustOrder/markOrderAsAdjusted');
const { FACTORIES_NAMES } = require('../../../../../constants/factoriesNames');
const factory = require('../../../../../factories');
const { expect } = require('../../../../../support/chaiHelper');

describe('test markOrderAsAdjusted UOW', () => {
    let store, serviceOrder;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);

        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
            storeCustomerId: storeCustomer.id,
        });
    });

    it('should successfully mark order as adjusted in ServiceOrder', async () => {
        const txn = await transaction.start(Model.knex());
        const payload = { serviceOrder, transaction: txn };
        const markedOrder = await markOrderAsAdjusted(payload);
        const markedOrderModel = await ServiceOrder.query(txn).findById(serviceOrder.id);
        expect(markedOrder).to.eq(payload);
        expect(markedOrderModel.isAdjusted).to.be.true;
    });
});
