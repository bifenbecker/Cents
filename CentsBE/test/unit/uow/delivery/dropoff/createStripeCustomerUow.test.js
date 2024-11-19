require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    createStripeCustomer,
} = require('../../../../../uow/delivery/dropoff/createStripeCustomerUow');
const factory = require('../../../../factories');
const CentsCustomerAddress = require('../../../../../models/centsCustomerAddress');
const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
const {
    generateExpectedStripeCustomerObject,
} = require('../../../../mocks/third-party/stripe/customers');

describe('test create stripe customer UOW', () => {
    describe('test createStripeCustomer', () => {
        let stripeCustomersCreate;

        beforeEach(async () => {
            stripeCustomersCreate = sinon
                .stub(stripe.customers, 'create')
                .callsFake((stripeData) => ({
                    ...stripeData,
                    id: Math.floor(Math.random() * 1000),
                }));
        });

        it('should create new stripe customer', async () => {
            // arrange
            const centsCustomer = await factory.create('centsCustomerWithAddress');
            const address = await CentsCustomerAddress.query().findById(centsCustomer.addresses[0]);

            const payload = {
                centsCustomerId: centsCustomer.id,
                address,
            };

            // act
            const result = await createStripeCustomer(payload);

            // assert
            expect(result).to.have.property('customer');
            expect(result.customer).to.have.property('stripeCustomerId');

            sinon.assert.called(stripeCustomersCreate);
        });

        it('should not create new stripe customer if one already exists', async () => {
            // arrange
            const testStripeCustomerId = '42';
            const centsCustomer = await factory.create('centsCustomerWithAddress', {
                stripeCustomerId: testStripeCustomerId,
            });
            const address = await CentsCustomerAddress.query().findById(centsCustomer.addresses[0]);

            const payload = {
                centsCustomerId: centsCustomer.id,
                address,
            };

            // act
            const result = await createStripeCustomer(payload);

            // assert
            expect(result).to.have.property('customer');
            expect(result.customer).to.have.property('stripeCustomerId', testStripeCustomerId);

            sinon.assert.notCalled(stripeCustomersCreate);
        });

        it('should create a stripe customer without address info when the stripeCustomerId is null', async () => {
            const centsCustomer = await factory.create('centsCustomer', {
                stripeCustomerId: null,
            });
            const stripePayload = {
                email: centsCustomer.email,
                name: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
                phone: centsCustomer.phoneNumber,
            };
            const expectedStripePayload = generateExpectedStripeCustomerObject(stripePayload);
            const payload = {
                centsCustomerId: centsCustomer.id,
            };

            stripeCustomersCreate.withArgs(stripePayload).returns(expectedStripePayload);

            // act
            const output = await createStripeCustomer(payload);
            const { customer } = output;

            // assert
            expect(customer.stripeCustomerId).to.equal(expectedStripePayload.id);
        });
    });
});
