require('../../../testHelper');
const sinon = require('sinon');
const stripe = require('../../../../stripe/stripeWithSecret');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const {
    assertPostResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const Payment = require('../../../../models/payment');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/order/update`;
}

class StripeInvalidRequestError extends Error {
    constructor(message = '', type, decline_code) {
        super();
        this.type = type;
        this.decline_code = decline_code;
    };
}

describe('test updateOrderStatus api', () => {
    let store, token, teamMember, teamMemberStore, storeCustomer, serviceOrder, order,
        orderDelivery, serviceOrderWeight;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        storeCustomer = await factory.create(FN.storeCustomer);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 0,
        });
        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
        });
        serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        teamMember = await factory.create(FN.teamMember, {
            employeeCode: '123',
            businessId: store.businessId,
        });
        teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => getApiEndPoint(),
    );

    it('should throw an error if payment_intent is unknown', async () => {
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'requires_confirmation',
        });
        const stripeInvalidRequestError = new StripeInvalidRequestError(
            '',
            'StripeInvalidRequestError',
            'resource_missing'
        );
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(payment.paymentToken)
            .throws(stripeInvalidRequestError);
        const body = {
            id: serviceOrder.id,
            status: 'COMPLETED',
            employeeCode: '123',
            weight: {
                totalWeight: 100.00,
                chargeableWeight: 99.00,
                bagCount: 1,
                teamMemberId: teamMember.id,
            },
            rack: 'testRack',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        const updatedPayment = await Payment.query()
            .findById(payment.id)
            .withGraphJoined('orders');
        res.should.have.status(500);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.eq("Invalid parameters were supplied to Stripe's API.");
        expect(updatedPayment.status).to.equal('resource_missing');
    });

    it('should update order status successfully', async () => {
        const body = {
            id: serviceOrder.id,
            status: 'READY_FOR_PICKUP',
            employeeCode: '123',
            weight: {
                totalWeight: 100.00,
                chargeableWeight: 99.00,
                bagCount: 1,
                teamMemberId: teamMember.id,
            },
            rack: 'testRack',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('orderItems').to.be.an('array');
        expect(res.body).to.have.property('activityLog').to.be.an('array');
        expect(res.body).to.have.property('status').to.equal(body.status);
        expect(res.body).to.have.property('orderDetails').to.be.an('object');
    });
});