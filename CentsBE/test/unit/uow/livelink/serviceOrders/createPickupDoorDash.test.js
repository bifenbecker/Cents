require('../../../../testHelper');
const nock = require('nock');
const momenttz = require('moment-timezone');
const factory = require('../../../../factories');
const { assert, expect } = require('../../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const createPickupDoorDash = require('../../../../../uow/liveLink/serviceOrders/createPickupDoorDash');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { deliveryProviders, ORDER_DELIVERY_TYPES } = require('../../../../../constants/constants');

describe('test createPickupDoorDash UoW', () => {
    const initialData = 'initialData';
    const mockedDoorDashResponse = { mockedResponse: 'mockedResponse' };
    let entities;
    let doorDashValidationMock;
    let doorDashDeliveriesMock;

    beforeEach(async () => {
        entities = await createUserWithBusinessAndCustomerOrders();
        doorDashValidationMock = nock(`${process.env.DOORDASH_API_URL}`)
            .post('/validations')
            .reply(200, {});
        doorDashDeliveriesMock = nock(`${process.env.DOORDASH_API_URL}`)
            .post('/deliveries')
            .reply(200, mockedDoorDashResponse);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('should return valid payload', () => {
        it('upon delivery not DoorDash', async () => {
            const payload = {
                initialData,
                orderDelivery: {
                    pickup: { deliveryProvider: deliveryProviders.OWN_DRIVER },
                },
            };
            const initialPayload = JSON.parse(JSON.stringify(payload));

            // call Uow
            const newPayload = await createPickupDoorDash(payload);

            // assert
            assert.deepEqual(newPayload, initialPayload, 'should return initial payload');
            expect(doorDashValidationMock.isDone(), 'should not call validate DoorDash API').to.be
                .false;
            expect(doorDashDeliveriesMock.isDone(), 'should not call deliveries DoorDash API').to.be
                .false;
        });

        it('on DoorDash delivery', async () => {
            const { centsCustomer, store, serviceOrder } = entities;
            const centsCustomerAddress = await factory.create(FN.centsCustomerAddress, {
                centsCustomerId: centsCustomer.id,
            });

            const startWindow = momenttz().add(2, 'd');
            const endWindow = momenttz().add(2, 'd').add(2, 'h');

            const payload = {
                initialData,
                serviceOrder,
                store,
                address: centsCustomerAddress,
                customer: centsCustomer,
                orderDelivery: {
                    pickup: {
                        deliveryProvider: deliveryProviders.DOORDASH,
                        type: ORDER_DELIVERY_TYPES.PICKUP,
                        deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                    },
                },
            };
            const initialPayload = JSON.parse(JSON.stringify(payload));

            // call Uow
            const newPayload = await createPickupDoorDash(payload);

            // assert
            expect(doorDashValidationMock.isDone(), 'should call validate DoorDash API').to.be.true;
            expect(doorDashDeliveriesMock.isDone(), 'should call deliveries DoorDash API').to.be
                .true;
            expect(newPayload).have.property('thirdPartyPickup');
            assert.deepEqual(
                JSON.parse(JSON.stringify(newPayload)),
                {
                    ...initialPayload,
                    thirdPartyPickup: mockedDoorDashResponse,
                },
                'should return payload with thirdPartyPickup from DoorDash API',
            );
        });
    });
});
