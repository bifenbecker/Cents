require('../../../../testHelper');
const { createSelfServeTurnUow } = require('../../../../../uow/machines/runMachine/createSeflServeTurnUow');
const { expect, chai } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const {
    serviceTypes,
    deviceStatuses,
    turnStatuses,
    origins,
} = require('../../../../../constants/constants');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const Turns = require('../../../../../models/turns');
const StoreCustomer = require('../../../../../models/storeCustomer');
const eventEmitter = require('../../../../../config/eventEmitter');

describe('test createSelfServeTurnUow function', () => {
    let business, machine, device, store, centsCustomer, storeCustomer;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            status: deviceStatuses.ONLINE,
            isPaired: true,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: business.id,
        });
    });

    it('should create a storeCustomer if it does not exist', async () => {
        await StoreCustomer.query().delete();
        const payloadMock = {
            serviceType: serviceTypes.SELF_SERVICE,
            origin: origins.LIVE_LINK,
            machineId: machine.id,
            machineDetails: {
                id: machine.id,
                store: {
                    id: store.id,
                    businessId: business.id,
                },
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            quantity: 1,
            deviceId: device.id,
            centsCustomerId: 35264,
            centsCustomer,
            businessId: business.id,
        };
        const spy = chai.spy(() => {});
        eventEmitter.once('indexCustomer', spy);

        await createSelfServeTurnUow(payloadMock);
        const storeCustomer = await StoreCustomer.query().first();
        expect(storeCustomer.storeId).to.be.eql(store.id);
        expect(storeCustomer.businessId).to.be.eql(business.id);
        expect(storeCustomer.centsCustomerId).to.be.eql(centsCustomer.id);
        expect(spy).to.have.been.called.with(storeCustomer.id);
    });

    it('should create a Self Serve turn if payload is valid', async () => {
        const payloadMock = {
            serviceType: serviceTypes.SELF_SERVICE,
            origin: origins.LIVE_LINK,
            machineDetails: {
                id: machine.id,
                store: {
                    id: store.id,
                    businessId: business.id,
                },
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            quantity: 1,
            deviceId: device.id,
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
        };

        const result = await createSelfServeTurnUow(payloadMock);
        const turn = await Turns.query().findOne({
            machineId: machine.id,
            serviceType: serviceTypes.SELF_SERVICE,
        });

        expect(result).to.deep.equal({
            ...payloadMock,
            turnId: turn.id,
            deviceStatus: deviceStatuses.IN_USE,
            turn: {
                id: turn.id,
                storeCustomerId: storeCustomer.id,
                machineId: payloadMock.machineDetails.id,
                serviceType: payloadMock.serviceType,
                origin: payloadMock.origin,
                deviceId: payloadMock.deviceId,
                storeId: payloadMock.machineDetails.store.id,
                turnCode: 1001,
                status: turnStatuses.CREATED,
                netOrderTotalInCents: payloadMock.quantity * payloadMock.machineDetails.machinePricings[0].price,
            },
        });
    })
});
