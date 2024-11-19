require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/orders/sales`;
}

describe('test getDetailedOrdersReport', () => {
    let user,
        laundromatBusiness,
        store,
        token,
        centsCustomer,
        storeCustomer,
        teamMember,
        inventory,
        inventoryItem;

    beforeEach(async () => {
        user = await factory.create('user');
        laundromatBusiness = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: laundromatBusiness.id,
        });
        token = generateToken({ id: store.id });
        centsCustomer = await factory.create('centsCustomer');
        storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            languageId: 1,
        });
        teamMember = await factory.create('teamMember', {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
        inventory = await factory.create('inventory', {
            productName: 'washing powder',
        });
        inventoryItem = await factory.create('inventoryItem', {
            storeId: store.id,
            inventoryId: inventory.id,
        });
    })

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get detailed orders report successfully when status is completed for service order', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            netOrderTotal: 0,
            employeeCode: teamMember.id,
            orderCode: '13',
            userId: user.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            hubId: store.id,
            status: 'COMPLETED',
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            orderId: serviceOrder.id,
            teamMemberId: teamMember.id,
        });
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
            status: 'random',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const payments = await factory.create('payments', {
            customerId: user.id,
            orderId: order.id,
            storeId: store.id,
            esdReceiptNumber: '123',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const orderDelivery = await factory.create('orderDelivery', {
            totalDeliveryCost: 20,
            orderId: order.id,
            type: 'PICKUP',
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const serviceCategory = await factory.create('serviceCategory', {
            businessId: laundromatBusiness.id,
            category: 'FIXED_PRICE',
        });
        const serviceMaster = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
            name: 'wash and fold',
        });
        const servicePrice = await factory.create('servicePrice', {
            storeId: store.id,
            serviceId: serviceMaster.id,
        });
        const serviceReferenceItem = await factory.create('serviceReferenceItem', {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
            serviceId: serviceMaster.id,
            inventoryItemId: inventoryItem.id,
            quantity: 1,
        });
        const serviceOrderWeight = await factory.create('serviceOrderWeight', {
            teamMemberId: teamMember.id,
            editedBy: teamMember.id,
            adjustedBy: teamMember.id,
            referenceItemId: serviceReferenceItem.id,
            serviceOrderId: serviceOrder.id,
            status: 'random',
            step: 1,
            totalWeight: 10.00,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'COMPLETED',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].length).to.eq(22);
        expect(res.body.report[0][0]).to.eq(`WF-${serviceOrder.orderCode}`);
        expect(res.body.report[0][1]).to.eq(store.address);
        expect(res.body.report[0][4]).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
        expect(res.body.report[0][15]).to.eq(serviceOrder.paymentStatus);
        expect(res.body.report[0][16]).to.eq(serviceOrder.status);
    });

    it('should get detailed orders report successfully when status is completed for inventory order', async () => {
        const inventoryOrder = await factory.create('inventoryOrder', {
            netOrderTotal: 0,
            orderCode: '15',
            customerId: user.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            employeeId: teamMember.id,
            status: 'COMPLETED',
        });
        const order = await factory.create('order', {
            orderableType: 'InventoryOrder',
            orderableId: inventoryOrder.id,
        });
        const payments = await factory.create('payments', {
            customerId: user.id,
            orderId: order.id,
            storeId: store.id,
            esdReceiptNumber: '123',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const orderPromoDetail = await factory.create('orderPromoDetail', {
            orderId: order.id,
        });
        const inventoryOrderItem = await factory.create('inventoryOrderItem', {
            inventoryOrderId: inventoryOrder.id,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'COMPLETED',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].length).to.eq(22);
        expect(res.body.report[0][0]).to.eq(`INV-${inventoryOrder.orderCode}`);
        expect(res.body.report[0][1]).to.eq(store.address);
        expect(res.body.report[0][4]).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
        expect(res.body.report[0][15]).to.eq(inventoryOrder.paymentStatus);
        expect(res.body.report[0][16]).to.eq(inventoryOrder.status);
    });

    it('should get detailed orders report successfully when status is active', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            netOrderTotal: 0,
            employeeCode: teamMember.id,
            orderCode: '13',
            userId: user.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            hubId: store.id,
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            orderId: serviceOrder.id,
            teamMemberId: teamMember.id,
            status: 'READY_FOR_PICKUP',
        });
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
            status: 'random',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const payments = await factory.create('payments', {
            customerId: user.id,
            orderId: order.id,
            storeId: store.id,
            esdReceiptNumber: '123',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
            paymentProcessor: 'stripe',
        });
        const orderDelivery = await factory.create('orderDelivery', {
            totalDeliveryCost: 20,
            orderId: order.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const serviceCategory = await factory.create('serviceCategory', {
            businessId: laundromatBusiness.id,
            category: 'PER_POUND',
        });
        const serviceMaster = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
            name: 'wash and fold',
        });
        const servicePrice = await factory.create('servicePrice', {
            storeId: store.id,
            serviceId: serviceMaster.id,
        });
        const serviceReferenceItem = await factory.create('serviceReferenceItem', {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
            serviceId: serviceMaster.id,
            inventoryItemId: inventoryItem.id,
            quantity: 1,
        });
        const serviceOrderWeight = await factory.create('serviceOrderWeight', {
            teamMemberId: teamMember.id,
            editedBy: teamMember.id,
            adjustedBy: teamMember.id,
            referenceItemId: serviceReferenceItem.id,
            serviceOrderId: serviceOrder.id,
            status: 'random',
            step: 1,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'ACTIVE',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].length).to.eq(22);
        expect(res.body.report[0][0]).to.eq(`WF-${serviceOrder.orderCode}`);
        expect(res.body.report[0][1]).to.eq(store.address);
        expect(res.body.report[0][4]).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
        expect(res.body.report[0][15]).to.eq(serviceOrder.paymentStatus);
        expect(res.body.report[0][16]).to.eq(serviceOrder.status);
    });

    it('should get detailed orders report successfully when status is completed and active', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            netOrderTotal: 0,
            employeeCode: teamMember.id,
            orderCode: '13',
            userId: user.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            hubId: store.id,
            status: 'COMPLETED',
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            orderId: serviceOrder.id,
            teamMemberId: teamMember.id,
            status: 'READY_FOR_PICKUP',
        });
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
            status: 'random',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const payments = await factory.create('payments', {
            customerId: user.id,
            orderId: order.id,
            storeId: store.id,
            esdReceiptNumber: '123',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
            paymentProcessor: 'stripe',
        });
        const orderDelivery = await factory.create('orderDelivery', {
            totalDeliveryCost: 20,
            orderId: order.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const serviceCategory = await factory.create('serviceCategory', {
            businessId: laundromatBusiness.id,
            category: 'PER_POUND',
        });
        const serviceMaster = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
            name: 'wash and fold',
        });
        const servicePrice = await factory.create('servicePrice', {
            storeId: store.id,
            serviceId: serviceMaster.id,
        });
        const serviceReferenceItem = await factory.create('serviceReferenceItem', {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
            serviceId: serviceMaster.id,
            inventoryItemId: inventoryItem.id,
            quantity: 1,
        });
        const serviceOrderWeight = await factory.create('serviceOrderWeight', {
            teamMemberId: teamMember.id,
            editedBy: teamMember.id,
            adjustedBy: teamMember.id,
            referenceItemId: serviceReferenceItem.id,
            serviceOrderId: serviceOrder.id,
            status: 'random',
            step: 1,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'COMPLETED_AND_ACTIVE',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].length).to.eq(22);
        expect(res.body.report[0][0]).to.eq(`WF-${serviceOrder.orderCode}`);
        expect(res.body.report[0][1]).to.eq(store.address);
        expect(res.body.report[0][4]).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
        expect(res.body.report[0][15]).to.eq(serviceOrder.paymentStatus);
        expect(res.body.report[0][16]).to.eq(serviceOrder.status);
    });

    it('should get detailed orders report successfully when status is else', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            netOrderTotal: 0,
            employeeCode: teamMember.id,
            orderCode: '13',
            userId: user.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            hubId: store.id,
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            orderId: serviceOrder.id,
            teamMemberId: teamMember.id,
            status: 'READY_FOR_PICKUP',
        });
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
            status: 'random',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const payments = await factory.create('payments', {
            customerId: user.id,
            orderId: order.id,
            storeId: store.id,
            esdReceiptNumber: '123',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
            paymentProcessor: 'stripe',
        });
        const orderDelivery = await factory.create('orderDelivery', {
            totalDeliveryCost: 20,
            orderId: order.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const serviceCategory = await factory.create('serviceCategory', {
            businessId: laundromatBusiness.id,
            category: 'PER_POUND',
        });
        const serviceMaster = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
            name: 'wash and fold',
        });
        const servicePrice = await factory.create('servicePrice', {
            storeId: store.id,
            serviceId: serviceMaster.id,
        });
        const serviceReferenceItem = await factory.create('serviceReferenceItem', {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
            serviceId: serviceMaster.id,
            inventoryItemId: inventoryItem.id,
            quantity: 1,
        });
        const serviceOrderWeight = await factory.create('serviceOrderWeight', {
            teamMemberId: teamMember.id,
            editedBy: teamMember.id,
            adjustedBy: teamMember.id,
            referenceItemId: serviceReferenceItem.id,
            serviceOrderId: serviceOrder.id,
            status: 'random',
            step: 1,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'SUBMITTED',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].length).to.eq(22);
        expect(res.body.report[0][0]).to.eq(`WF-${serviceOrder.orderCode}`);
        expect(res.body.report[0][1]).to.eq(store.address);
        expect(res.body.report[0][4]).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
        expect(res.body.report[0][15]).to.eq(serviceOrder.paymentStatus);
        expect(res.body.report[0][16]).to.eq(serviceOrder.status);
    });

    it('should throw an error if params not passed', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{}).set('authtoken', token);
        res.should.have.status(500);
    });
});