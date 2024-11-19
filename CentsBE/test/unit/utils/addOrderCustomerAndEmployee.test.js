require('../../testHelper');
const chai = require('chai');
const { paymentTimings } = require('../../../constants/constants');
const {
    getServiceOrderAndCustomerDetails,
    appendOrderCustomerAndEmployee,
} = require('../../../utils/addOrderCustomerAndEmployee');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { expect } = require('../../support/chaiHelper');
const { createMiddlewareMockedArgs } = require('../../support/mockers/createMiddlewareMockedArgs');

const PROMOTION_CODE = 'TEST';
const ACTIVE_DAYS_ALL = [
    { day: 'sunday' },
    { day: 'monday' },
    { day: 'tuesday' },
    { day: 'wednesday' },
    { day: 'thursday' },
    { day: 'friday' },
    { day: 'saturday' },
];

describe('test addOrderCustomerAndEmployee', () => {
    describe('test getServiceOrderAndCustomerDetails', () => {
        it('should return correct service order and customer details data', async () => {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            const store = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
            const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                storeId: store.id,
                businessId: store.businessId,
                centsCustomerId: centsCustomer.id,
            });
            const promotion = await factory.create(FACTORIES_NAMES.promotion, {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 0,
                activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
            });
            const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                netOrderTotal: 100,
                orderTotal: 200,
                balanceDue: 150,
                convenienceFee: 300,
                promotionAmount: 1,
                paymentTiming: paymentTimings['PRE-PAY'],
                promotionId: promotion.id,
            });
            const order = await factory.create(FACTORIES_NAMES.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const details = await getServiceOrderAndCustomerDetails(order.id);
            expect(details.customerPhoneNumber).to.be.equal(storeCustomer.phoneNumber);
            expect(details.customerName).to.be.equal(
                `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            );
            expect(details.storeCustomerId).to.be.equal(storeCustomer.id);
            expect(details.centsCustomerId).to.be.equal(centsCustomer.id);
            expect(details.status).to.be.equal(serviceOrder.status);
            expect(details.paymentTiming).to.be.equal(serviceOrder.paymentTiming);
            expect(details.orderType).to.be.equal(serviceOrder.orderType);
            expect(details.storeId).to.be.equal(serviceOrder.storeId);
            expect(details.previousPromotionId).to.be.equal(serviceOrder.promotionId);
            expect(details.previousNetOrderTotal).to.be.equal(serviceOrder.netOrderTotal);
            expect(details.previousOrderTotal).to.be.equal(serviceOrder.orderTotal);
            expect(details.previousPaymentStatus).to.be.equal(serviceOrder.paymentStatus);
            expect(details.previousCreditAmount).to.be.equal(0);
            expect(details.previousTipAmount).to.be.equal(0);
            expect(details.previousPromotionAmount).to.be.equal(serviceOrder.promotionAmount);
            expect(details.previousBalanceDue).to.be.equal(serviceOrder.balanceDue);
            expect(details.previousConvenienceFee).to.be.equal(serviceOrder.convenienceFee);
        });
    });

    describe('test appendOrderCustomerAndEmployee', () => {
        it('should call next() if body is empty', async () => {
            const req = {
                body: {},
            };
            const res = null;
            const next = chai.spy();

            await appendOrderCustomerAndEmployee(req, res, next);
            expect(next).to.have.been.called();
        });

        it('should throw an error if order does not exist', async () => {
            const req = {
                body: {
                    orderId: 1,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await appendOrderCustomerAndEmployee(mockedReq, mockedRes, mockedNext);
            expect(mockedNext.called, 'should call next(error)').to.be.true;
            expect(mockedNext.getCall(0).args[0].message).to.be.equal('Service order not found');
        });

        it('should call next() if data is correct', async () => {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            const store = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
            const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                storeId: store.id,
                businessId: store.businessId,
            });
            const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
                businessId: business.id,
            });
            const promotion = await factory.create(FACTORIES_NAMES.promotion);
            const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                storeCustomerId: storeCustomer.id,
                promotionId: promotion.id,
            });
            const order = await factory.create(FACTORIES_NAMES.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });

            const req = {
                body: {
                    orderId: order.id,
                    employeeCode: teamMember.employeeCode,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await appendOrderCustomerAndEmployee(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedReq.constants.employee.employeeCode).to.be.equal(teamMember.employeeCode);

            expect(mockedReq.constants.currentOrderDetails).to.have.property('customerPhoneNumber');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('customerName');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('storeCustomerId');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('centsCustomerId');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('status');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('paymentTiming');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('orderType');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('storeId');
            expect(mockedReq.constants.currentOrderDetails).to.have.property('previousPromotionId');
            expect(mockedReq.constants.currentOrderDetails).to.have.property(
                'previousNetOrderTotal',
            );
            expect(mockedReq.constants.currentOrderDetails).to.have.property('previousOrderTotal');
            expect(mockedReq.constants.currentOrderDetails).to.have.property(
                'previousPaymentStatus',
            );
            expect(mockedReq.constants.currentOrderDetails).to.have.property(
                'previousCreditAmount',
            );
            expect(mockedReq.constants.currentOrderDetails).to.have.property('previousTipAmount');
            expect(mockedReq.constants.currentOrderDetails).to.have.property(
                'previousPromotionAmount',
            );
            expect(mockedReq.constants.currentOrderDetails).to.have.property('previousBalanceDue');
            expect(mockedReq.constants.currentOrderDetails).to.have.property(
                'previousConvenienceFee',
            );
        });
    });
});
