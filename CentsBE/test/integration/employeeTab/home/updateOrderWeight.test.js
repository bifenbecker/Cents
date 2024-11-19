require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const BusinessSetting = require('../../../../models/businessSettings');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    assertPatchResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/order/weights/edit`;
}

describe('test updateOrderWeight api', () => {
    let store, token, order, serviceCategory, serviceMaster,
        inventoryItem, serviceOrderWeight, serviceOrderItem,
        serviceReferenceItem, serviceReferenceItemDetail,
        serviceOrder, teamMember, teamMemberStore;

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
        teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
            employeeCode: '123',
        });
        teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
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
        () => getApiEndPoint(),
    );

    it('should update order weight successfully', async () => {
        const body = {
            employeeCode: teamMember.employeeCode,
            serviceOrderId: serviceOrder.id,
            serviceOrderWeightId: serviceOrderWeight.id,
            totalWeight: 100.00,
            editReason: 'test',
        };
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body.orderDetails.weightLogs.length).to.eq(1);
        expect(res.body.orderDetails.weightLogs[0].totalWeight).to.equal(body.totalWeight);
        expect(res.body.orderDetails.weightLogs[0].editReason).to.equal(body.editReason);
    });

    it('should update order weight where requiresEmployeeCode is true', async () => {
        const user = await teamMember.getUser();
        const body = {
            employeeCode: teamMember.employeeCode,
            serviceOrderId: serviceOrder.id,
            serviceOrderWeightId: serviceOrderWeight.id,
            totalWeight: 100.00,
            editReason: 'test',
        };
        await BusinessSetting.query()
            .where('businessId', store.businessId)
            .patch({
                requiresEmployeeCode: true,
            });
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body.orderDetails.weightLogs.length).to.eq(1);
        expect(res.body.orderDetails.weightLogs[0].totalWeight).to.equal(body.totalWeight);
        expect(res.body.orderDetails.weightLogs[0].editReason).to.equal(body.editReason);
        expect(res.body.orderDetails.weightLogs[0].editedByTeamMember.user.firstname).to.equal(user.firstname);
        expect(res.body.orderDetails.weightLogs[0].editedByTeamMember.user.lastname).to.equal(user.lastname);
    });

    it('should throw an error if body is not passed', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint()).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.eq('child "totalWeight" fails because ["totalWeight" is required]');
    });
});