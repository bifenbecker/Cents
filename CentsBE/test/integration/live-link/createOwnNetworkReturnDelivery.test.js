require('../../testHelper');
const faker = require('faker');
const sinon = require('sinon');
const { expect } = require('../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../support/pipelineTestHelper');
const factory = require('../../factories');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const stripe = require('../../../stripe/stripeWithSecret');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../constants/responseMocks');
const Constants = require('../../../constants/constants');

const endpointName = 'live-status/delivery/return/own';
const apiEndpoint = `/api/v1/${endpointName}`;

async function getBodyPayload() {
    const {
        serviceOrder,
        centsCustomer,
        storeCustomer,
        store,
        partnerSubsidiaryPaymentMethod: { paymentMethodToken },
    } = await createUserWithBusinessAndCustomerOrders({
        createPartnerSubsidiary: true,
    });
    const centsCustomerAddress = await factory.create(FN.centsCustomerAddress, {
        centsCustomerId: centsCustomer.id,
    });
    const timings = await factory.create(FN.timing);

    const bodyPayload = {
        address: centsCustomerAddress,
        centsCustomerId: centsCustomer.id,
        deliveryCost: faker.commerce.price(),
        deliveryProvider: 'OWN_DRIVER',
        deliveryWindow: [1, 2],
        paymentToken: paymentMethodToken,
        serviceOrderId: serviceOrder.id,
        storeCustomerId: storeCustomer.id,
        storeId: store.id,
        timingsId: timings.id,
    };

    return {
        bodyPayload,
        entities: {
            serviceOrder,
        },
    };
}

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            it('should return correct response', async () => {
                const {
                    bodyPayload,
                    entities: { serviceOrder },
                } = await getBodyPayload();
                const mockedResult = await endpointPipelineMock({
                    method: 'post',
                    apiEndpoint,
                    body: bodyPayload,
                    pipelineReturn: {
                        success: true,
                        serviceOrder: {
                            id: serviceOrder.id,
                        },
                    },
                });

                const stubbedPipelineRun = mockedResult.stubbedPipelineRun;
                const response = mockedResult.response;

                response.should.have.status(200);
                response.body.should.not.be.empty;
                response.body.should.have.property('success', true);
                response.body.should.have.property('output');
                response.body.should.have.property('order');
                expect(stubbedPipelineRun.called, 'pipeline run should be called').to.be.true;
            });
        });

        describe('that running with error', () => {
            it('Pipeline should catch error', async () => {
                const { bodyPayload } = await getBodyPayload();
                const response = await endpointPipelineErrorMock({
                    method: 'post',
                    apiEndpoint,
                    body: bodyPayload,
                });

                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            it('should return correct response', async () => {
                const {
                    bodyPayload,
                    entities: { serviceOrder },
                } = await getBodyPayload();
                sinon
                    .stub(stripe.paymentIntents, 'create')
                    .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
                
                sinon
                    .stub(stripe.paymentIntents, 'retrieve')
                    .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
                    .returns({
                        payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                        status: 'requires_confirmation'
                    });
                sinon
                    .stub(stripe.paymentMethods, 'retrieve')
                    .withArgs(CREATE_STRIPE_INTENT_RESPONSE.payment_method)
                    .returns({
                        card: {
                            last4: 1234,
                            brand: 'Visa',
                        },
                        id: 42,
                    });

                const body = bodyPayload;
                const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, bodyPayload);
                const initialServiceOrder = serviceOrder;

                const {
                    body: { output, order },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('output');
                response.body.should.have.property('order');
                expect(output).to.have.property('address');
                expect(output).to.have.property('business');
                expect(output).to.have.property('centsCustomerAddressId');
                expect(output).to.have.property('centsCustomerId');
                expect(output).to.have.property('customer');
                expect(output).to.have.property('customerAddress');
                expect(output).to.have.property('deliveryCost');
                expect(output).to.have.property('deliveryProvider');
                expect(output).to.have.property('deliveryWindow').to.be.eql(body.deliveryWindow);
                expect(output).to.have.property('order');
                expect(output).to.have.property('orderActivityLog');
                expect(output).to.have.property('orderDelivery');
                expect(output).to.have.property('origin').to.be.equal(Constants.origins.LIVE_LINK);
                expect(output).to.have.property('returnMethod').to.be.equal('DELIVERY');
                expect(output).to.have.property('stripePaymentIntent');

                const { deliveryCost } = body;
                const { balanceDue, netOrderTotal } = initialServiceOrder;

                const totalPaid = Number(CREATE_STRIPE_INTENT_RESPONSE.amount / 100).toFixed(2);
                const finalNetOrderTotal = Number(
                    Number(netOrderTotal) + Number(deliveryCost),
                ).toFixed(2);
                const finalBalanceDue = Number(
                    (Number(balanceDue) + Number(deliveryCost) - totalPaid),
                ).toFixed(2);

                expect(order.balanceDue.toFixed(2)).to.be.equal(finalBalanceDue);
                expect(order).to.have.property('canCancel').to.be.false;
                expect(order)
                    .to.have.property('netOrderTotal')
                    .to.be.equal(Number(finalNetOrderTotal));
                expect(order).to.have.property('pickupDeliveryFee').to.be.equal(0);
                expect(order).to.have.property('pickupDeliveryTip').to.be.equal(0);
                expect(order).to.have.property('refundAmount').to.be.equal(0);
                expect(order)
                    .to.have.property('returnDeliveryFee')
                    .to.be.equal(Number(deliveryCost));
                expect(order).to.have.property('returnDeliveryTip').to.be.equal(0);
                expect(order)
                    .to.have.property('status')
                    .to.be.equal(Constants.statuses.READY_FOR_DRIVER_PICKUP);
                expect(order).to.have.property('taxAmount').to.be.equal(0);
                expect(order).to.have.property('tipAmount').to.be.equal(0);
                expect(order).to.have.property('tipOption').to.be.equal('');
                expect(order).to.have.property('totalPaid').to.be.equal(Number(totalPaid));
            });
        });
    });
});
