require('../../testHelper');
const chai = require('chai');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../support/apiTestHelper');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { expect } = require('../../support/chaiHelper');
const { paymentStatuses } = require('../../../constants/constants');
const ServiceOrder = require('../../../models/serviceOrders');
const setOrderCalculationsDetails = require('../../../middlewares/setOrderCalculationsDetails');

const promotionsEndpoint = (id) => `/api/v1/employee-tab/home/orders/${id}/promotions/update`;
const tipAmountEndpoint = (id) => `/api/v1/employee-tab/home/orders/${id}/tipAmount/update`;
const creditEndpoint = (id) => `/api/v1/employee-tab/home/orders/${id}/credit/update`;

const endpoints = [promotionsEndpoint, tipAmountEndpoint, creditEndpoint];

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test setOrderCalculationsDetails', () => {
    let store, token, laundromatBusiness, centsCustomer, storeCustomer;

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
    });

    endpoints.forEach((endpoint) => {
        it(`should throw an error if order is absent [${endpoint.name}]`, async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeCustomerId: storeCustomer.id,
            });

            const res = await ChaiHttpRequestHelper.patch(endpoint(serviceOrder.id)).set(
                'authtoken',
                token,
            );

            res.should.have.status(500);
            expect(res.body)
                .to.have.property('error')
                .to.equal(`Cannot read property 'id' of null`);
        });
    });

    endpoints.forEach((endpoint) => {
        it(`should throw an error if serviceOrder order entry is absent [${endpoint.name}]`, async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeCustomerId: storeCustomer.id,
            });

            const params = {
                id: serviceOrder.id,
            };

            const res = await ChaiHttpRequestHelper.patch(endpoint(serviceOrder.id), params).set(
                'authtoken',
                token,
            );

            res.should.have.status(500);
            expect(res.body)
                .to.have.property('error')
                .to.equal(`Cannot read property 'id' of null`);
        });
    });

    endpoints.forEach((endpoint) => {
        it(`should throw an error if order is already paid [${endpoint.name}]`, async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeCustomerId: storeCustomer.id,
            });

            await ServiceOrder.query()
                .where({ id: serviceOrder.id })
                .patch({
                    paymentStatus: paymentStatuses.PAID,
                })
                .returning('*');

            const order = await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });

            await factory.create(FN.payment, {
                storeId: store.id,
                orderId: order.id,
                serviceOrderId: serviceOrder.id,
                status: 'succeeded',
                paymentToken: 'cash',
                paymentProcessor: 'cash',
                stripeClientSecret: 'cash',
                totalAmount: 100,
                appliedAmount: 100,
                createdAt: new Date('4-6-2022').toISOString(),
            });

            const params = {
                id: serviceOrder.id,
            };

            const res = await ChaiHttpRequestHelper.patch(endpoint(serviceOrder.id), params).set(
                'authtoken',
                token,
            );

            res.should.have.status(409);
            expect(res.body)
                .to.have.property('error')
                .to.equal(`You cannot update an order that has already been paid for.`);
        });
    });

    endpoints.forEach((endpoint) => {
        it(`should call next() if data is correct [${endpoint.name}]`, async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeCustomerId: storeCustomer.id,
            });
            await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });

            const params = {
                id: serviceOrder.id,
            };

            const res = await ChaiHttpRequestHelper.patch(endpoint(serviceOrder.id), params).set(
                'authtoken',
                token,
            );

            res.should.have.status(200);
        });
    });

    it('should call next() if data is correct (alternative)', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
        });
        await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        const req = { params: { id: null }, constants: { order: { id: serviceOrder.id } } };
        const res = null;
        const next = chai.spy();

        await setOrderCalculationsDetails(req, res, next);
        expect(next).to.have.been.called();
    });
});
