const sinon = require('sinon');
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const addCustomerPaymentMethodPipeline = require('../../../../../pipeline/customer/paymentMethod/addCustomerPaymentMethodPipeline');
const Pipeline = require('../../../../../pipeline/pipeline');
const factory = require('../../../../factories');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

const testStripePaymentToken = 'pm_1I8UKlGhs3YLpJjFXBV7GFCo';
const testLast4 = 1234;
const testBrand = 'Visa';

describe('test addCustomerPaymentMethodPipeline pipeline', () => {
    let stubbedPipelineRun, sandbox, payload, stripePaymentMethodsStub, centsCustomer;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();

        centsCustomer = await factory.create(FN.centsCustomer);

        payload = {
            payment: {
                provider: 'test',
                type: 'test-type',
                token: testStripePaymentToken,
            },
            rememberPaymentMethod: true,
            requireCustomerPaymentsList: true,
            centsCustomerId: centsCustomer.id,
        };

        sinon.stub(stripe.customers, 'create').callsFake((stripeData) => ({
            ...stripeData,
            id: Math.floor(Math.random() * 1000),
        }));
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should call Pipeline run', async () => {
        const output = { resp: 'data' };
        stubbedPipelineRun = sandbox.stub(Pipeline.prototype, 'run').returns(output);
        const payload = { some: 'data' };
        const result = await addCustomerPaymentMethodPipeline(payload);
        sinon.assert.calledWith(stubbedPipelineRun, payload);
        expect(result).to.equal(output);
    });

    it('should throw error when something fails', async () => {
        stubbedPipelineRun = sandbox
            .stub(Pipeline.prototype, 'run')
            .returns(new Error('Pipeline error!'));
        const payload = { some: 'data' };
        const result = await addCustomerPaymentMethodPipeline(payload);
        sinon.assert.calledWith(stubbedPipelineRun, payload);
        expect(result.message).to.eql('Pipeline error!');
    });

    it('should have paymentMethods in response if requireCustomerPaymentsList is true', async () => {
        sinon
            .stub(stripe.paymentMethods, 'retrieve')
            .withArgs(testStripePaymentToken)
            .returns({
                card: {
                    last4: testLast4,
                    brand: testBrand,
                },
            });
        const response = await addCustomerPaymentMethodPipeline(payload);
        expect(response).to.have.property('paymentMethods').to.have.lengthOf(1);
    });

    it('should not have have paymentMethods in response if requireCustomerPaymentsList is false', async () => {
        payload.requireCustomerPaymentsList = false;
        stripePaymentMethodsStub = sinon.stub(stripe.paymentMethods);
        const response = await addCustomerPaymentMethodPipeline(payload);
        expect(response).not.to.have.property('paymentMethods');
    });
});
