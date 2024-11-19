require('../../../../testHelper');
const factory = require('../../../../factories');
const { chai, expect } = require('../../../../support/chaiHelper');
const VoidServiceOrder = require('../../../../../services/orders/serviceOrders/voidServiceOrder');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { statuses, ORDER_TYPES } = require('../../../../../constants/constants');

describe('test voidServiceOrder', () => {
    let store, serviceOrder, centsCustomer;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            orderType: ORDER_TYPES.SERVICE,
            status: statuses.READY_FOR_PROCESSING,
        });
        await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
    });

    it('should build VoidServiceOrder instance when metaData is absent', async () => {
        const voidServiceOrder = new VoidServiceOrder(serviceOrder.id);

        expect(voidServiceOrder.transaction).to.be.null;
        expect(voidServiceOrder.serviceOrderId).to.equal(serviceOrder.id);
        expect(voidServiceOrder.metaData).to.be.empty;
    });

    describe('test perform', () => {
        it('should throw an error when order not found', async () => {
            const voidServiceOrder = new VoidServiceOrder(0);

            await expect(voidServiceOrder.perform()).to.be.rejectedWith('Order not found');
        });

        it('should throw an error when order can not be voided', async () => {
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            const voidServiceOrder = new VoidServiceOrder(serviceOrder.id);

            await expect(voidServiceOrder.perform()).to.be.rejectedWith('Order can not be voided');
        });

        it('should call perform and validate', async () => {
            const voidServiceOrder = new VoidServiceOrder(serviceOrder.id);
            validateSpy = chai.spy.on(voidServiceOrder, 'validate');
            performSpy = chai.spy.on(voidServiceOrder, 'perform');
            await voidServiceOrder.perform();

            expect(validateSpy).to.have.been.called();
            expect(performSpy).to.have.been.called();
            expect(voidServiceOrder.metaData.customerId).to.equal(centsCustomer.id);
            expect(voidServiceOrder.serviceOrder.id).to.equal(serviceOrder.id);
        });
    });
});
