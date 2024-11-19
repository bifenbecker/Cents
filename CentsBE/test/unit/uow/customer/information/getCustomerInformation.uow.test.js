require('../../../../testHelper');
const { expect, assert } = require('../../../../support/chaiHelper')
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const getCustomerInformationUow = require('../../../../../uow/customer/information/getCustomerInformationUow');
const stripe = require('../../../../../routes/stripe/config');
const sinon = require('sinon');
const { getExpectedStripePaymentMethods } = require('../../../../mocks/third-party/stripe/paymentMethods');

describe('test getCustomerInformationUow function', () => {
    describe('when cents customer without payment methods', () => {
        let business;
        let store;
        let centsCustomer;
        let centsCustomerAddress;
        let storeCustomer;
        let creditHistory;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            centsCustomerAddress = await factory.create(FACTORIES_NAMES.centsCustomerAddress, {
                centsCustomerId: centsCustomer.id,
            })
            creditHistory = await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: 10,
                customerId: centsCustomer.id,
                businessId: business.id,
            })

            storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                storeId: store.id,
            });
        });

        it('should return customer info w/o stripe payment cards', async () => {
            const payloadMock = {
                id: centsCustomer.id,
                storeId: store.id,
                businessId: business.id,
            };
            const paymentMethodTokenMock = 'some_stripe_mocked_token';
            const expectedStripePayloadMock = getExpectedStripePaymentMethods(paymentMethodTokenMock);

            sinon.stub(stripe.paymentMethods, 'retrieve').withArgs(paymentMethodTokenMock).returns(expectedStripePayloadMock);

            const result = await getCustomerInformationUow(payloadMock);
            const resultCustomer = result?.customer;
            expect(result).to.be.an('object');
            expect(result).to.have.property('id').to.eql(centsCustomer.id);
            expect(result).to.have.property('storeId').to.eql(store.id);
            expect(result).to.have.property('customer').to.be.an('object');
            expect(resultCustomer).to.have.property('firstName').to.eql(centsCustomer.firstName);
            expect(resultCustomer).to.have.property('lastName').to.eql(centsCustomer.lastName);
            expect(resultCustomer).to.have.property('phoneNumber').to.eql(centsCustomer.phoneNumber);
            expect(resultCustomer).to.have.property('id').to.eql(centsCustomer.id);
            expect(resultCustomer?.storeCustomers?.length).to.be.greaterThan(0);
            expect(resultCustomer?.paymentMethods?.length).to.be.eql(0);
            expect(resultCustomer?.addresses?.length).to.be.greaterThan(0);
            expect(resultCustomer?.availableCredits).to.be.eql(storeCustomer.creditAmount);
        });
    });

    describe('when cents customer with payment methods', () => {
        const storeCustomerNotes = 'storeCustomerNotes';
        let business;
        let store;
        let centsCustomer;
        let centsCustomerAddress;
        let creditHistory;
        let storeCustomer;
        let paymentMethodStripe;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            centsCustomerAddress = await factory.create(FACTORIES_NAMES.centsCustomerAddress, {
                centsCustomerId: centsCustomer.id,
            });
            creditHistory = await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: 10,
                customerId: centsCustomer.id,
                businessId: business.id,
            });
            storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                storeId: store.id,
                notes: storeCustomerNotes,
            });
        });

        it('should return customer info with stripe payment cards', async () => {
            paymentMethodStripe = await factory.create(FACTORIES_NAMES.paymentMethodStripe, {
                centsCustomerId: centsCustomer.id,
            });

            const payloadMock = {
                id: centsCustomer.id,
                storeId: store.id,
                businessId: business.id,
            };
            const paymentMethodTokenMock = paymentMethodStripe.paymentMethodToken;
            const expectedStripePayloadMock = getExpectedStripePaymentMethods(paymentMethodTokenMock);

            sinon.stub(stripe.paymentMethods, 'retrieve').withArgs(paymentMethodTokenMock).returns(expectedStripePayloadMock);

            const result = await getCustomerInformationUow(payloadMock);
            const resultCustomer = result?.customer;
            expect(result).to.be.an('object');
            expect(result).to.have.property('id').to.eql(centsCustomer.id);
            expect(result).to.have.property('storeId').to.eql(store.id);
            expect(result).to.have.property('customer').to.be.an('object');
            expect(resultCustomer).to.have.property('firstName').to.eql(centsCustomer.firstName);
            expect(resultCustomer).to.have.property('lastName').to.eql(centsCustomer.lastName);
            expect(resultCustomer).to.have.property('phoneNumber').to.eql(centsCustomer.phoneNumber);
            expect(resultCustomer).to.have.property('id').to.eql(centsCustomer.id);
            expect(resultCustomer?.storeCustomers?.length).to.be.greaterThan(0);
            expect(resultCustomer?.paymentMethods?.length).to.be.greaterThan(0);
            expect(resultCustomer?.addresses?.length).to.be.greaterThan(0);
            expect(resultCustomer?.availableCredits).to.be.eql(storeCustomer.creditAmount);
        });

        it('should return customer info without stripe payment cards', async () => {
            const { firstName, lastName, phoneNumber, id: centsCustomerId } = centsCustomer;
            const { isDeleted, ...paymentMethod } = await factory.create(FACTORIES_NAMES.paymentMethod, {centsCustomerId});
            const payload = {
                id: centsCustomerId,
                storeId: store.id,
                businessId: business.id,
            };
            const stripeApi = sinon.stub(stripe.paymentMethods, 'retrieve');

            const newPayload = await getCustomerInformationUow(payload);

            assert.include(newPayload, payload, 'should have initial properties');
            expect(newPayload)
                .have.property('customer')
                .to.be.an('object')
                .include.keys('paymentMethods', 'availableCredits');

            const { paymentMethods, availableCredits, ...payloadCustomer } = newPayload.customer;
            assert.include(
                payloadCustomer,
                { firstName, lastName, phoneNumber, id: centsCustomerId },
                'should include initial centsCustomer',
            );
            expect(payloadCustomer).have.property('storeCustomers').to.be.an('array').lengthOf(1);
            expect(payloadCustomer.storeCustomers[0]).have.property('notes', storeCustomerNotes);
            expect(payloadCustomer).have.property('addresses').to.be.an('array').lengthOf(1);
            expect(payloadCustomer.addresses[0]).have.property('id', centsCustomerAddress.id);
            expect(availableCredits).to.be.eql(storeCustomer.creditAmount);
            expect(paymentMethods).to.be.an('array').lengthOf(1);
            expect(paymentMethods[0], 'should include Payment method').to.be.an('object').include(paymentMethod)
            expect(paymentMethods[0], 'must have null in card data').include({ last4: null, brand: null })
            expect(stripeApi.called, 'should not call stripe API').to.be.false;
        });
    });

    describe('when cents customer w/o store customer', () => {
        let business;
        let store;
        let centsCustomer;
        let centsCustomerAddress;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            centsCustomerAddress = await factory.create(FACTORIES_NAMES.centsCustomerAddress, {
                centsCustomerId: centsCustomer.id,
            });
        });

        it('should return customer info with 0 as available credits amount when we do not have credit history', async () => {
            const payloadMock = {
                id: centsCustomer.id,
                storeId: store.id,
                businessId: business.id,
            };
            const paymentMethodTokenMock = 'some_stripe_mocked_token';
            const expectedStripePayloadMock = getExpectedStripePaymentMethods(paymentMethodTokenMock);

            sinon.stub(stripe.paymentMethods, 'retrieve').withArgs(paymentMethodTokenMock).returns(expectedStripePayloadMock);

            const result = await getCustomerInformationUow(payloadMock);
            const resultCustomer = result?.customer;
            expect(result).to.be.an('object');
            expect(result).to.have.property('id').to.eql(centsCustomer.id);
            expect(result).to.have.property('storeId').to.eql(store.id);
            expect(result).to.have.property('customer').to.be.an('object');
            expect(resultCustomer).to.have.property('firstName').to.eql(centsCustomer.firstName);
            expect(resultCustomer).to.have.property('lastName').to.eql(centsCustomer.lastName);
            expect(resultCustomer).to.have.property('phoneNumber').to.eql(centsCustomer.phoneNumber);
            expect(resultCustomer).to.have.property('id').to.eql(centsCustomer.id);
            expect(resultCustomer?.storeCustomers?.length).to.be.eql(0);
            expect(resultCustomer?.addresses?.length).to.be.greaterThan(0);
            expect(resultCustomer?.availableCredits).to.be.eql(0);
        });

        it('should return customer info with exact sum as available credits amount when we have credit history and StoreCustomer in current Store', async () => {
            const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                storeId: store.id,
            });
            const amountDepositMock = 9;
            const amountWithdrawMock = -4;
            await factory.create(FACTORIES_NAMES.creditHistory, {
                customerId: centsCustomer.id,
                businessId: business.id,
                amount: amountDepositMock
            });
            await factory.create(FACTORIES_NAMES.creditHistory, {
                customerId: centsCustomer.id,
                businessId: business.id,
                amount: amountWithdrawMock
            });

            const payloadMock = {
                id: centsCustomer.id,
                storeId: store.id,
                businessId: business.id,
            };
            const paymentMethodTokenMock = 'some_stripe_mocked_token';
            const expectedStripePayloadMock = getExpectedStripePaymentMethods(paymentMethodTokenMock);

            sinon.stub(stripe.paymentMethods, 'retrieve').withArgs(paymentMethodTokenMock).returns(expectedStripePayloadMock);

            const result = await getCustomerInformationUow(payloadMock);

            const expectedCreditsSum = amountDepositMock + amountWithdrawMock;
            const resultCustomer = result?.customer;
            expect(result).to.be.an('object');
            expect(result).to.have.property('id').to.eql(centsCustomer.id);
            expect(result).to.have.property('storeId').to.eql(store.id);
            expect(result).to.have.property('customer').to.be.an('object');
            expect(resultCustomer).to.have.property('firstName').to.eql(centsCustomer.firstName);
            expect(resultCustomer).to.have.property('lastName').to.eql(centsCustomer.lastName);
            expect(resultCustomer).to.have.property('phoneNumber').to.eql(centsCustomer.phoneNumber);
            expect(resultCustomer).to.have.property('id').to.eql(centsCustomer.id);
            expect(resultCustomer.storeCustomers?.length).to.be.eql(1);
            expect(resultCustomer.storeCustomers[0]).to.have.property('id').to.eql(storeCustomer.id);
            expect(resultCustomer?.addresses?.length).to.be.greaterThan(0);
            expect(resultCustomer?.availableCredits).to.be.eql(expectedCreditsSum);
        });

        it('should return customer info with exact sum as available credits amount when we do not have StoreCustomer in current Store but have in another Store with same Business', async () => {
            const storeSecond = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            await factory.create(FACTORIES_NAMES.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                storeId: store.id,
            });
            const amountDepositMock = 9;
            const amountWithdrawMock = -4;
            await factory.create(FACTORIES_NAMES.creditHistory, {
                customerId: centsCustomer.id,
                businessId: business.id,
                amount: amountDepositMock
            });
            await factory.create(FACTORIES_NAMES.creditHistory, {
                customerId: centsCustomer.id,
                businessId: business.id,
                amount: amountWithdrawMock
            });

            const payloadMock = {
                id: centsCustomer.id,
                storeId: storeSecond.id,
                businessId: business.id,
            };
            const paymentMethodTokenMock = 'some_stripe_mocked_token';
            const expectedStripePayloadMock = getExpectedStripePaymentMethods(paymentMethodTokenMock);

            sinon.stub(stripe.paymentMethods, 'retrieve').withArgs(paymentMethodTokenMock).returns(expectedStripePayloadMock);

            const result = await getCustomerInformationUow(payloadMock);

            const expectedCreditsSum = amountDepositMock + amountWithdrawMock;
            const resultCustomer = result?.customer;
            expect(result).to.be.an('object');
            expect(result).to.have.property('id').to.eql(centsCustomer.id);
            expect(result).to.have.property('storeId').to.eql(storeSecond.id);
            expect(result).to.have.property('customer').to.be.an('object');
            expect(resultCustomer).to.have.property('firstName').to.eql(centsCustomer.firstName);
            expect(resultCustomer).to.have.property('lastName').to.eql(centsCustomer.lastName);
            expect(resultCustomer).to.have.property('phoneNumber').to.eql(centsCustomer.phoneNumber);
            expect(resultCustomer).to.have.property('id').to.eql(centsCustomer.id);
            expect(resultCustomer.storeCustomers?.length).to.be.eql(0);
            expect(resultCustomer?.addresses?.length).to.be.greaterThan(0);
            expect(resultCustomer?.availableCredits).to.be.eql(expectedCreditsSum);
        });
    });

    it('should throw error for not passing the payload', async () => {
        expect(getCustomerInformationUow()).rejectedWith(Error);
    });
});
