require('../../../../testHelper');
const { expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { getTurnDetailsWithOrderUow } = require('../../../../../uow/liveLink/selfService/getTurnDetailsWithOrderUow');
const { serviceTypes, ORDERABLE_TYPES } = require('../../../../../constants/constants');
const { formattedTime } = require('../../../../../utils/formattedTime');
const Turn = require('../../../../../models/turns');
const {
    getMachineNamePrefix,
    getMachinePricePerTurn,
    getMachineType
} = require('../../../../../utils/machines/machineUtil');
const { getTotalTurnTimeInMinutes } = require('../../../../../utils/machines/turnUtil');

describe('test getTurnDetailsWithOrderUow function', () => {
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
            address: 'Santa monica, 9',
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: business.id,
            firstName: 'Rey',
            lastName: 'Donalds',
            phoneNumber: '+15559995555',
        })
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
        machinePricing = await factory.create(FACTORIES_NAMES.machinePricing, {
            machineId: machine.id,
            price: 100,
        })
        turn = await factory.create(FACTORIES_NAMES.turn, {
            storeCustomerId: storeCustomer.id,
            machineId: machine.id,
            storeId: store.id,
            serviceType: serviceTypes.SELF_SERVICE,
            turnCode: 1000 + 1 + 1,
            netOrderTotalInCents: machinePricing.price,
        });
        order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableType: ORDERABLE_TYPES.TURN,
            orderableId: turn.id,
        });
    })

    describe('when the turn does not exist', () => {
        it('should reject with Error', async () => {
            const payloadMock = {
                turnId: 4783643,
                constants: { storeCustomer },
            };

            await expect(getTurnDetailsWithOrderUow(payloadMock)).to.be.rejectedWith('Turn is not found');
        });
    });

    describe('when the turn exists', () => {
        it('should return formatted response with exact values', async () => {
            const payloadMock = {
                turnId: turn.id,
                constants: { storeCustomer },
            };
            const turnDetails = await Turn.query()
                .findById(turn.id)
                .withGraphJoined(
                    '[machine.[model.[machineType], machinePricings], store.[settings], storeCustomer, order, turnLineItems]',
                );
            const timeZone = 'UTC';
            const totalTurnTime = getTotalTurnTimeInMinutes(turnDetails.turnLineItems);

            const result = await getTurnDetailsWithOrderUow(payloadMock);

            expect(result).to.deep.equal({
                id: turnDetails.id,
                code: turnDetails.turnCode,
                status: turnDetails.status,
                serviceType: turnDetails.serviceType,
                createdAt: formattedTime(turnDetails.createdAt, timeZone),
                startedAt: formattedTime(turnDetails.startedAt, timeZone),
                completedAt: formattedTime(turnDetails.completedAt, timeZone),
                enabledAt: formattedTime(turnDetails.enabledAt, timeZone),
                netOrderTotalInCents: turnDetails.netOrderTotalInCents,
                totalTurnTime,
                machine: {
                    id: machine.id,
                    name: machine.name,
                    prefix: getMachineNamePrefix(turnDetails.machine.model),
                    pricePerTurnInCents: getMachinePricePerTurn(turnDetails.machine),
                    type: getMachineType(turnDetails.machine.model),
                },
                business: {
                    id: store.businessId,
                },
                store: {
                    id: store.id,
                    address: store.address,
                },
                storeCustomer: {
                    id: storeCustomer.id,
                    firstName: storeCustomer.firstName,
                    lastName: storeCustomer.lastName,
                    phoneNumber: storeCustomer.phoneNumber,
                },
                order: {
                    id: order.id,
                    orderableType: order.orderableType,
                    subtotal: turnDetails.netOrderTotalInCents / 100,
                    totalPaid: turnDetails.netOrderTotalInCents / 100,
                    promotion: {},
                },
            })
        });
    });
});
