require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const Settings = require('../../../../../models/businessSettings');
const orderAdjustment = require('../../../../../validations/employeeTab/washAndFold/orderAdjustment');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');

describe('test orderAdjustment validation', () => {
    let store, token;
    const apiEndPoint = (id) => `/api/v1/employee-tab/home/orders/${id}`;

    beforeEach(async () => {
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
        token = generateToken({
            id: store.id,
        });
    });

    it('should fail if orderId is absent', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const body = { id: serviceOrder.id };
        const res = await ChaiHttpRequestHelper.put(apiEndPoint(serviceOrder.id), {}, body).set(
            'authtoken',
            token,
        );

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('orderId is required');
    });

    it('should fail if totalWeight is absent', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const body = {
            id: serviceOrder.id,
            orderId: order.id,
        };
        const res = await ChaiHttpRequestHelper.put(apiEndPoint(serviceOrder.id), {}, body).set(
            'authtoken',
            token,
        );

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('totalWeight is required');
    });

    it('should fail if storeId is absent', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });
        const body = {
            id: serviceOrder.id,
            orderId: order.id,
            totalWeight: serviceOrderWeight.totalWeight,
        };
        const res = await ChaiHttpRequestHelper.put(apiEndPoint(serviceOrder.id), {}, body).set(
            'authtoken',
            token,
        );

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "storeId" fails because ["storeId" is required]');
    });

    it('should fail if orderType is absent', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });
        const body = {
            id: serviceOrder.id,
            orderId: order.id,
            storeId: store.id,
            totalWeight: serviceOrderWeight.totalWeight,
        };
        const res = await ChaiHttpRequestHelper.put(apiEndPoint(serviceOrder.id), {}, body).set(
            'authtoken',
            token,
        );

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "orderType" fails because ["orderType" is required]');
    });

    it('should fail if employeeCode is absent', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create(FACTORIES_NAMES.businessSetting, {
            requiresEmployeeCode: true,
            businessId: store.businessId,
        });
        const body = {
            id: serviceOrder.id,
            orderType: order.orderableType,
            orderId: order.id,
            storeId: store.id,
            totalWeight: serviceOrderWeight.totalWeight,
        };
        const res = await ChaiHttpRequestHelper.put(apiEndPoint(serviceOrder.id), {}, body).set(
            'authtoken',
            token,
        );

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "employeeCode" fails because ["employeeCode" is required]');
    });

    it('should fail if serviceOrder id is not correct', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });
        const body = {
            id: serviceOrder.id,
            orderType: order.orderableType,
            orderId: order.id,
            storeId: store.id,
            totalWeight: serviceOrderWeight.totalWeight,
        };
        const res = await ChaiHttpRequestHelper.put(apiEndPoint(0), {}, body).set(
            'authtoken',
            token,
        );

        res.should.have.status(404);
        expect(res.body).to.have.property('error').to.equal('Order not found.');
    });

    it('should call next(error) if data is not correct', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });

        const req = {
            params: { id: serviceOrder.id },
            body: {
                id: serviceOrder.id,
                orderType: order.orderableType,
                orderId: order.id,
                storeId: store.id,
                totalWeight: serviceOrderWeight.totalWeight,
            },
            constants: {
                employee: null,
                serviceOrder: null,
            },
            currentStore: {
                settings: {
                    requiresEmployeeCode: false,
                },
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await orderAdjustment(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should call next() if data is correct', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });

        const req = {
            params: { id: serviceOrder.id },
            body: {
                id: serviceOrder.id,
                orderType: order.orderableType,
                orderId: order.id,
                storeId: store.id,
                totalWeight: serviceOrderWeight.totalWeight,
            },
            constants: {
                employee: null,
                serviceOrder: null,
            },
            currentStore: {
                settings: {
                    requiresEmployeeCode: false,
                },
                id: store.id,
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await orderAdjustment(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedReq.constants).to.have.property('serviceOrder');
    });

    it('should call next() if data is correct (alternative)', async () => {
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: store.businessId,
            userId: user.id,
        });
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
            employeeCode: teamMember.id,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });

        const req = {
            params: { id: serviceOrder.id },
            body: {
                id: serviceOrder.id,
                orderType: order.orderableType,
                orderId: order.id,
                storeId: store.id,
                totalWeight: serviceOrderWeight.totalWeight,
                employeeCode: teamMember.employeeCode,
                customerNotes: 'test customer note',
            },
            currentStore: {
                settings: {
                    requiresEmployeeCode: true,
                },
                id: store.id,
                businessId: store.businessId,
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await orderAdjustment(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedReq.constants).to.have.property('employee');
    });
});
