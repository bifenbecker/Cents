require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    assertPatchResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

function getApiEndPoint(id) {
    return `/api/v1/employee-tab/home/orders/${id}/paymentTiming/update`;
}
const paymentTiming = 'POST-PAY';

describe('test updateOrderPaymentTiming api', () => {
    let store, token, serviceOrder, inventoryItem, serviceOrderItem, serviceReferenceItem,
        serviceOrderWeight, order, serviceMaster, serviceCategory, serviceReferenceItemDetail;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({ id: store.id });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            paymentTiming: 'PRE-PAY',
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        serviceCategory = await factory.create(FN.perPoundServiceCategory, {
            businessId: store.businessId,
        });
        serviceMaster = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
        });
        serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
        serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: inventoryItem.id,
            soldItemType: 'InventoryItem',
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPatchResponseError,
        () => getApiEndPoint(1),
    );

    it('should update order payment timing successfully', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(serviceOrder.id), {}, {
            paymentTiming,
        }).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body.orderDetails.paymentTiming).to.equal(paymentTiming);
    });

    it('should throw an error if paymentTiming is not passed', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(serviceOrder.id)).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error');
    });
});