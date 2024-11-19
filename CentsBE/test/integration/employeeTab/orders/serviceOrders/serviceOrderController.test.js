require('../../../../testHelper');
const ServiceOrder = require('../../../../../models/serviceOrders');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { chai, expect } = require('../../../../support/chaiHelper');
const OrderActivityLog = require('../../../../../models/orderActivityLog');
const Settings = require('../../../../../models/businessSettings');
const ServiceOrderBags = require('../../../../../models/serviceOrderBags');
const eventEmitter = require('../../../../../config/eventEmitter');
const { statuses, ORDER_TYPES } = require('../../../../../constants/constants');
const { paymentStatuses } = require('../../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertPatchResponseSuccess,
    assertPatchResponseError,
    assertPutResponseSuccess,
    assertPutResponseError,
} = require('../../../../support/httpRequestsHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const {
    updatePromotionTipAndCredit,
} = require('../../../../../routes/employeeTab/orders/serviceOrders/serviceOrderController');

const promotionsEndpoint = {
    getEndpoint: (id) => `/api/v1/employee-tab/home/orders/${id}/promotions/update`,
    apiMethodName: 'patch',
};
const tipAmountEndpoint = {
    getEndpoint: (id) => `/api/v1/employee-tab/home/orders/${id}/tipAmount/update`,
    apiMethodName: 'patch',
};
const creditEndpoint = {
    getEndpoint: (id) => `/api/v1/employee-tab/home/orders/${id}/credit/update`,
    apiMethodName: 'patch',
};
const convenienceFeeEndpoint ={
    getEndpoint: (id) => `/api/v1/employee-tab/orders/service-orders/convenience-fee/update/${id}`,
    apiMethodName: 'put',
};

const endpoints = [promotionsEndpoint, tipAmountEndpoint, creditEndpoint, convenienceFeeEndpoint];

const responseErrorAsserts = {
    patch: assertPatchResponseError,
    put: assertPutResponseError,
};

const responseSuccessAsserts = {
    patch: assertPatchResponseSuccess,
    put: assertPutResponseSuccess,
};

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test serviceOrderController', () => {
    describe('test updatePromotionTipAndCredit', () => {
        const apiEndPoint = (id) => `/api/v1/employee-tab/home/orders/${id}/promotions/update`;

        let store, token, laundromatBusiness, centsCustomer, convenienceFee, storeCustomer, serviceOrder;

        beforeEach(async () => {
            laundromatBusiness = await factory.create(FN.laundromatBusiness);
            centsCustomer = await factory.create(FN.centsCustomer);
            store = await factory.create(FN.store);
            storeCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                businessId: laundromatBusiness.id,
                centsCustomerId: centsCustomer.id,
            });
            token = await getToken(store.id);
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeCustomerId: storeCustomer.id,
            });
            convenienceFee = await factory.create(FN.convenienceFee, {
                businessId: store.businessId,
            });
        });

        // shared tests

        endpoints.forEach((endpoint) => {
            itShouldCorrectlyAssertTokenPresense(responseErrorAsserts[endpoint.apiMethodName], () =>
                apiEndPoint(serviceOrder.id),
            );
        });

        endpoints.forEach((endpoint) => {
            it(`should return updated orderDetails and status 200 [${endpoint.getEndpoint(':id')}]`, async () => {
                const promotion = await factory.create(FN.promotion, {
                    businessId: laundromatBusiness.id,
                });
                const serviceOrder = await factory.create(FN.serviceOrder, {
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                    promotionId: promotion.id,
                    balanceDue: 10,
                    netOrderTotal: 100,
                });
                await factory.create(FN.order, {
                    orderableId: serviceOrder.id,
                    orderableType: 'ServiceOrder',
                });

                let body;
                if(endpoint.getEndpoint() === convenienceFeeEndpoint.getEndpoint()) {
                    body = {
                        convenienceFeeId: convenienceFee.id
                    };
                }

                const res = await responseSuccessAsserts[endpoint.apiMethodName]({
                    url: endpoint.getEndpoint(serviceOrder.id),
                    token,
                    body,
                });
                const order = await ServiceOrder.query().findById(serviceOrder.id).returning('*');
                const resDate = new Date(res.body.orderDetails.completedAt);

                res.should.have.status(200);
                expect({
                    ...res.body.orderDetails,
                    completedAt: resDate.toDateString(),
                    userId: order.userId,
                    storeCustomerId: order.storeCustomerId,
                }).to.include({
                    ...serviceOrder,
                    completedAt: serviceOrder.completedAt.toDateString(),
                    // updates
                    promotionId: null,
                    paymentStatus: paymentStatuses.PAID,
                    balanceDue: 0,
                    netOrderTotal: 0,
                });
            });
        });

        it('should call next(error)', async () => {
            const req = {
                constants: {
                    serviceOrder: null,
                    orderCalculationAttributes: null,
                    currentOrderDetails: null,
                    orderId: null,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await updatePromotionTipAndCredit(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called, 'should call next(error)').to.be.true;
            expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
        });

        describe('test /api/v1/employee-tab/home/orders/:id/tipAmount/update', () => {
            it('should update tipAmount', async () => {
                const store = await factory.create(FN.store);
                const token = generateToken({
                    id: store.id,
                });
                const serviceOrder = await factory.create(FN.serviceOrder, {
                    storeId: store.id,
                });
                await factory.create(FN.order, {
                    orderableType: 'ServiceOrder',
                    orderableId: serviceOrder.id,
                });
                const tipAmount = 25;
                const res = await ChaiHttpRequestHelper.patch(
                    tipAmountEndpoint.getEndpoint(serviceOrder.id),
                    {},
                    {
                        tipAmount,
                    },
                ).set('authtoken', token);
                res.should.have.status(200);
                expect(res.body).to.have.property('orderDetails');
                expect(res.body.orderDetails).to.have.property('netOrderTotal').to.equal(tipAmount);
            });
        });

        describe('test /api/v1/employee-tab/home/orders/service-orders/convenience-fee/update/:id', () => {
            it('should return error if incorrect convenienceFeeId is provided', async () => {
                await assertPutResponseError({
                    url: convenienceFeeEndpoint.getEndpoint(serviceOrder.id),
                    token,
                    body: {
                        convenienceFeeId: -1
                    },
                    code: 500
                });
            });
    
            it('should return error if incorrect serviceOrder.id is provided', async () => {
                await assertPutResponseError({
                    url: convenienceFeeEndpoint.getEndpoint(-1),
                    token,
                    code: 500
                });
            });
        });
    });

    describe('test voidOrder', () => {
        const getApiEndPoint = (id) => {
            return `/api/v1/employee-tab/orders/service-orders/${id}/cancel`;
        }   
        let store, token, serviceOrder, storeCustomer;

        beforeEach(async () => {
            store = await factory.create(FN.store);
            token = generateToken({
                id: store.id,
            });
            storeCustomer = await factory.create(FN.storeCustomer, {
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

        itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () =>
            getApiEndPoint(serviceOrder.id),
        );

        it('should fail if order can not be voided', async () => {
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            await assertPutResponseError({
                url: getApiEndPoint(serviceOrder.id),
                params: {},
                body: {},
                token,
                code: 500,
                expectedError: 'Order can not be voided',
            });
        });

        it('should void order successfully', async () => {
            const smsNotificationSpy = chai.spy();
            const indexCustomerSpy = chai.spy();
            eventEmitter.once('orderSmsNotification', smsNotificationSpy);
            eventEmitter.once('indexCustomer', indexCustomerSpy);
            const res = await ChaiHttpRequestHelper.put(getApiEndPoint(serviceOrder.id), {}, {}).set(
                'authtoken',
                token,
            );
                
            const isActivityLogCreated = await OrderActivityLog.query().findOne({
                orderId: serviceOrder.id,
            });


            res.should.have.status(200);
            expect(res.body).to.haveOwnProperty('success').to.be.true;
            expect(res.body).to.haveOwnProperty('orderDetails').to.not.be.empty;
            expect(res.body.orderDetails.id).to.equal(serviceOrder.id);
            expect(res.body.orderDetails.promotion).to.be.empty;
            expect(res.body.orderDetails.status).to.equal(statuses.CANCELLED);
            expect(res.body.orderDetails.serviceOrderBags).to.be.empty;
            expect(isActivityLogCreated).to.not.be.undefined;
            expect(smsNotificationSpy).to.have.been.called();
            expect(indexCustomerSpy).to.have.been.called.with(storeCustomer.id);
        });

        it('should successfully void order with passed employeeCode', async () => {
            const employeeCode = 100;
            await factory.create(FN.teamMember, {
                businessId: store.businessId,
                employeeCode,
            })
            await Settings.query()
                .findOne({
                    businessId: store.businessId,
                })
                .del();
            await factory.create(FN.businessSetting, {
                requiresEmployeeCode: true,
                businessId: store.businessId,
            });
            await assertPutResponseSuccess({
                url: getApiEndPoint(serviceOrder.id),
                params: {},
                body: {
                    employeeCode,
                },
                token,
            });
        });
    });

    describe('test editServiceOrderBagNotes', () => {
        const getApiEndPoint = (id) => {
            return `/api/v1/employee-tab/orders/service-orders/${id}/bag/notes/update`;
        }
        let token, serviceOrder;

        beforeEach(async () => {
            const store = await factory.create(FN.store);
            token = generateToken({
                id: store.id,
            });
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
        });
        
        itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () =>
            getApiEndPoint(serviceOrder.id),
        );

        it('should fail when bags not passed', async () => {
            await assertPutResponseError({
                url: getApiEndPoint(serviceOrder.id),
                body: {},
                token,
                code: 500,
                expectedError: `Cannot read property 'map' of undefined`,
            })
        });

        it('should return empty array when bags is empty', async () => {
            const res = await ChaiHttpRequestHelper.put(getApiEndPoint(serviceOrder.id), {}, {
                bags: [],
            }).set(
                'authtoken',
                token,
            );

            res.should.have.status(200);
            expect(res.body).to.haveOwnProperty('success').to.be.true;
            expect(res.body).to.haveOwnProperty('serviceOrderBags').to.be.empty;
        });

        it('should update ServiceOrderBags', async () => {
            const serviceOrderBag = await factory.create(FN.serviceOrderBag, {
                serviceOrderId: serviceOrder.id,
            });
            const bagsToUpdate = [{
                id: serviceOrderBag.id,
                description: 'updated_description',
                notes: 'updatad_notes'
            }];

            const res = await ChaiHttpRequestHelper.put(getApiEndPoint(serviceOrder.id), {}, {
                bags: bagsToUpdate,
            }).set(
                'authtoken',
                token,
            );

            const updatedBag = await ServiceOrderBags.query().findById(serviceOrderBag.id);

            res.should.have.status(200);
            expect(res.body).to.haveOwnProperty('success').to.be.true;
            expect(res.body.serviceOrderBags.length).to.equal(1);
            expect(res.body.serviceOrderBags[0].notes).to.equal(bagsToUpdate[0].notes);
            expect(res.body.serviceOrderBags[0].description).to.equal(bagsToUpdate[0].description);
            expect(updatedBag.notes).to.equal(bagsToUpdate[0].notes);
            expect(updatedBag.description).to.equal(bagsToUpdate[0].description);
        });
    });
});
