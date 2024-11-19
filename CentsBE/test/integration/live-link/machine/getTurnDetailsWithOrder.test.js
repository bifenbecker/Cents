require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { expect } = require('chai');
const { generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { ORDERABLE_TYPES, serviceTypes } = require('../../../../constants/constants');

const getApiEndpoint = (turnId) => `/api/v1/live-status/machine/turns/${turnId}/details`;

describe('test livelink getTurnDetailsWithOrder API', () => {
    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is empty', async () => {
            const apiEndpoint = getApiEndpoint('1');
            const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {});
            res.should.have.status(401);
        });

        it('should respond with a 404 when customerauthtoken is invalid', async () => {
            const apiEndpoint = getApiEndpoint('1');
            const token = generateLiveLinkCustomerToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set(
                'customerauthtoken',
                token,
            );
            res.should.have.status(404);
        });
    });

    describe('when auth token is valid', () => {
        let token;
        let business;
        let store;
        let centsCustomer;
        let storeCustomer;
        let machine;
        let machinePricing;
        let turn;
        let order;

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
            machine = await factory.create(FACTORIES_NAMES.machineWasher, {
                storeId: store.id,
            });
            machinePricing = await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                price: 100,
            })
            turn = await factory.create(FACTORIES_NAMES.turn, {
                storeCustomerId: storeCustomer.id,
                storeId: store.id,
                machineId: machine.id,
                serviceType: serviceTypes.SELF_SERVICE,
                turnCode: 1000 + 1 + 1,
                netOrderTotalInCents: machinePricing.price,
            });
            order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableType: ORDERABLE_TYPES.TURN,
                orderableId: turn.id,
            });

            token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        });

        describe('when params are invalid', () => {
            it('should respond with a 422 code when a param is not valid', async () => {
                const apiEndpoint = getApiEndpoint('jsdf');
                const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set('customerauthtoken', token);

                res.should.have.status(422);
            });

            it('should respond with a 422 code when a param is not integer', async () => {
                const apiEndpoint = getApiEndpoint(1.44);
                const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set('customerauthtoken', token);

                res.should.have.status(422);
            });

            it('should respond with a 422 code when a param "turnId" is negative', async () => {
                const apiEndpoint = getApiEndpoint(-5);
                const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set('customerauthtoken', token);

                res.should.have.status(422);
            });
        })

        describe('when params are valid', () => {
            it('should respond with a 404 when the turn is not found', async () => {
                const apiEndpoint = getApiEndpoint(6473);
                const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set('customerauthtoken', token);

                res.should.have.status(404);
            });

            it('should respond 400 if StoreCustomer is not found', async () => {
                const apiEndpoint = getApiEndpoint(turn.id);
                const centsCustomerWrong = await factory.create(FACTORIES_NAMES.centsCustomer);
                const tokenWrongCustomer = token = generateLiveLinkCustomerToken({ id: centsCustomerWrong.id });

                const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set('customerauthtoken', tokenWrongCustomer);

                res.should.have.status(400);
            });

            it('should respond 403 if a customer is not allowed to see the resource', async () => {
                const centsCustomerWrong = await factory.create(FACTORIES_NAMES.centsCustomer);
                const storeCustomerWrong = await factory.create(FACTORIES_NAMES.storeCustomer, {
                    centsCustomerId: centsCustomerWrong.id,
                    businessId: business.id,
                    storeId: store.id,
                });
                const device = await factory.create(FACTORIES_NAMES.devicePairedOnline, {
                    name: '33:44:dd:ii:pp:dd'
                });
                const turnForbidden = await factory.create(FACTORIES_NAMES.turn, {
                    storeCustomerId: storeCustomerWrong.id,
                    storeId: store.id,
                    deviceId: device.id,
                });

                const apiEndpoint = getApiEndpoint(turnForbidden.id);

                const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set('customerauthtoken', token);

                res.should.have.status(403);
            });

            it('should respond 200 if with formatted turn details', async () => {
                const apiEndpoint = getApiEndpoint(turn.id);
                const res = await ChaiHttpRequestHelper.get(apiEndpoint, {}, {}).set('customerauthtoken', token);
                const turnDetails = res.body;

                res.should.have.status(200);
                expect(turnDetails).to.have.property('id').to.be.a('number');
                expect(turnDetails).to.have.property('code').to.be.a('string');
                expect(turnDetails).to.have.property('status').to.be.a('string');
                expect(turnDetails).to.have.property('serviceType').to.be.a('string');
                expect(turnDetails).to.have.property('createdAt').not.to.be.undefined;
                expect(turnDetails).to.have.property('startedAt').not.to.be.undefined;
                expect(turnDetails).to.have.property('completedAt').not.to.be.undefined;
                expect(turnDetails).to.have.property('enabledAt').not.to.be.undefined;
                expect(turnDetails).to.have.property('netOrderTotalInCents').to.be.a('number');
                expect(turnDetails).to.have.property('totalTurnTime').to.be.a('number');

                expect(turnDetails).to.have.property('machine').to.have.property('id').to.be.a('number');
                expect(turnDetails).to.have.property('machine').to.have.property('name').to.be.a('string');
                expect(turnDetails).to.have.property('machine').to.have.property('prefix').to.be.a('string');
                expect(turnDetails).to.have.property('machine').to.have.property('pricePerTurnInCents').to.be.a('number');
                expect(turnDetails).to.have.property('machine').to.have.property('type').to.be.a('string');

                expect(turnDetails).to.have.property('business').to.have.property('id').to.be.a('number');

                expect(turnDetails).to.have.property('store').to.have.property('id').to.be.a('number');
                expect(turnDetails).to.have.property('store').to.have.property('address').to.be.a('string');

                expect(turnDetails).to.have.property('storeCustomer').to.have.property('id').to.be.a('number');
                expect(turnDetails).to.have.property('storeCustomer').to.have.property('firstName').to.be.a('string');
                expect(turnDetails).to.have.property('storeCustomer').to.have.property('lastName').to.be.a('string');
                expect(turnDetails).to.have.property('storeCustomer').to.have.property('phoneNumber').to.be.a('string');

                expect(turnDetails).to.have.property('order').to.have.property('id').to.be.a('number');
                expect(turnDetails).to.have.property('order').to.have.property('orderableType').to.be.a('string');
                expect(turnDetails).to.have.property('order').to.have.property('subtotal').to.be.a('number');
                expect(turnDetails).to.have.property('order').to.have.property('totalPaid').to.be.a('number');
                expect(turnDetails).to.have.property('order').to.have.property('promotion').to.be.empty;
            });
        });
    })
});
