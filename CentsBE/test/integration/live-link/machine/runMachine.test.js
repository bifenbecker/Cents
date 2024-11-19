require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const { expect, chai } = require('../../../support/chaiHelper');
chai.use(require('chai-as-promised'));
const sinon = require('sinon');
const faker = require('faker');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const StoreCustomer = require('../../../../models/storeCustomer');
const Turn = require('../../../../models/turns');
const Order = require('../../../../models/orders');
const { deviceStatuses, turnStatuses, ORDERABLE_TYPES, MACHINE_PAYMENT_TYPES } = require('../../../../constants/constants');
const { convertCentsToDollars } = require('../../../../utils/convertMoneyUnits');
const PusherOperations = require('../../../../pusher/PusherOperations');
const MessageBroker = require('../../../../message_broker/messageBroker');

const getApiEndpoint = (machineId) => `/api/v1/live-status/machine/${machineId}/run`;

describe('test runMachine endpoint', () => {
    let token;
    let business;
    let store;
    let centsCustomer;
    let storeCustomer;
    let machine;
    let machinePaymentType;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            storeId: store.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
        machinePaymentType = await factory.create(FACTORIES_NAMES.machinePaymentType, {
            type: MACHINE_PAYMENT_TYPES.APP,
        });

        token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
    });

    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is empty', async () => {
            const apiEndpoint = getApiEndpoint(1)
            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, {});
            res.should.have.status(401);
        });

        it('should respond with a 404 when customerauthtoken is invalid', async () => {
            const invalidToken = generateLiveLinkCustomerToken({ id: 100 });
            const apiEndpoint = getApiEndpoint(1)
            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, {}).set(
                'customerauthtoken',
                invalidToken,
            );
            res.should.have.status(404);
        });
    });

    describe('when auth token is valid', () => {
        it('should return 404 if a machine is not found', async () => {
            const apiEndpoint = getApiEndpoint(6354783);
            const mockBody = {
                quantity: 1,
                promoCode: 'jahdakdhka',
            };

            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);
            res.should.have.status(404);
        });

        it('should return 400 if credit amount is not enough', async () => {
            const apiEndpoint = getApiEndpoint(machine.id);
            const mockBody = {
                quantity: 1,
                promoCode: 'jahdakdhka',
            };
            await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: 0.01,
                customerId: centsCustomer.id,
                businessId: business.id,
            });
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                price: 1000,
            });

            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);
            res.should.have.status(400);
        });

        it('should return 202', async () => {
            const apiEndpoint = getApiEndpoint(machine.id);
            const mockBody = {
                quantity: 1,
                promoCode: 'jahdakdhka',
            };
            const creditAmountInitial = 200;
            await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: creditAmountInitial,
                customerId: centsCustomer.id,
                businessId: business.id,
            });
            const device = await factory.create(FACTORIES_NAMES.device, {
                name: faker.random.uuid(),
                isActive: true,
                isPaired: true,
                status: deviceStatuses.ONLINE,
            });
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                price: 10,
            });
            await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machine.id,
                deviceId: device.id,
            });

            sinon.stub(PusherOperations, 'publishStoreEvent');
            sinon.stub(MessageBroker, 'publish');

            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);
            const orderExpected = await Order.query().findOne({
                storeId: store.id,
                orderableType: ORDERABLE_TYPES.TURN,
            });
            const turnExpected = await Turn.query().findOne({
                storeCustomerId: storeCustomer.id,
                machineId: machine.id,
                storeId: store.id,
            });

            res.should.have.status(202);
            expect(res.body).to.deep.equal({
                success: true,
                orderId: orderExpected.id,
                turnId: turnExpected.id,
            });
        });

        it('should withdraw customer credit amount for a turn and create one', async () => {
            const apiEndpoint = getApiEndpoint(machine.id);
            const mockBody = {
                quantity: 2,
                promoCode: 'jahdakdhka',
            };
            const creditAmountInitial = 200;
            await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: creditAmountInitial,
                customerId: centsCustomer.id,
                businessId: business.id,
            });
            const device = await factory.create(FACTORIES_NAMES.device, {
                name: faker.random.uuid(),
                isActive: true,
                isPaired: true,
                status: deviceStatuses.ONLINE,
            });
            const machinePriceInCents = 100;
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                price: machinePriceInCents,
            })
            await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machine.id,
                deviceId: device.id,
            });

            sinon.stub(PusherOperations, 'publishStoreEvent');
            sinon.stub(MessageBroker, 'publish');

            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

            const storeCustomerExpected = await StoreCustomer.query().findById(storeCustomer.id);
            const turnCreated = await Turn.query().findOne({
                machineId: machine.id,
                deviceId: device.id,
                storeId: store.id,
                status: turnStatuses.CREATED,
            });
            const customerCreditsExpected = creditAmountInitial - convertCentsToDollars(machinePriceInCents) * mockBody.quantity;

            res.should.have.status(202);
            expect(storeCustomerExpected.creditAmount).to.be.eql(customerCreditsExpected);
            expect(turnCreated).to.have.property('serviceType').to.be.eql('SELF_SERVICE');
        });

        it('should invoke PublisherOperations.publishStoreEvent and MessageBroker.publish', async () => {
            const apiEndpoint = getApiEndpoint(machine.id);
            const mockBody = {
                quantity: 1,
                promoCode: 'jahdakdhka',
            };
            const creditAmountInitial = 200;
            await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: creditAmountInitial,
                customerId: centsCustomer.id,
                businessId: business.id,
            });
            const device = await factory.create(FACTORIES_NAMES.device, {
                name: faker.random.uuid(),
                isActive: true,
                isPaired: true,
                status: deviceStatuses.ONLINE,
            });
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                price: 10,
            })
            await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machine.id,
                deviceId: device.id,
            });

            const stub = sinon.stub();
            const spyPusher = chai.spy.on(PusherOperations, 'publishStoreEvent', stub);
            const spyMessageBroker = chai.spy.on(MessageBroker, 'publish', stub);

            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

            res.should.have.status(202);
            expect(spyPusher).to.have.been.called();
            expect(spyMessageBroker).to.have.been.called();
        });
    });
});
