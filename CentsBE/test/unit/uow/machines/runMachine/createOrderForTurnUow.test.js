require('../../../../testHelper');
const {
    createServiceOrderTurns,
    createOrderForTurn,
} = require('../../../../../uow/machines/runMachine/createOrderForTurnUow');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { serviceTypes } = require('../../../../../constants/constants');
const ServiceOrderTurn = require('../../../../../models/serviceOrderTurn');
const Order = require('../../../../../models/orders');

describe('test createOrderForTurnUow', () => {
    describe('test createServiceOrderTurns', () => {
        let serviceOrder, turn;

        beforeEach(async () => {
            serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder);
            turn = await factory.create(FACTORIES_NAMES.turn);
        });

        it('should create a service order turn for a full service', async () => {
            const payload = {
                serviceOrderId: serviceOrder.id,
                turnId: turn.id,
                serviceType: serviceTypes.FULL_SERVICE,
            };

            const result = await createServiceOrderTurns(payload);

            expect(result).to.equal(payload);

            const serviceOrderTurn = await ServiceOrderTurn.query()
                .where({
                    serviceOrderId: serviceOrder.id,
                    turnId: turn.id,
                })
                .first();

            expect(serviceOrderTurn).to.exist;
        });

        it("shouldn't create an item for a not full service", async () => {
            const payload = {
                serviceOrderId: serviceOrder.id,
                turnId: turn.id,
                serviceType: serviceTypes.CUSTOMER_SERVICE,
            };

            const result = await createServiceOrderTurns(payload);

            expect(result).to.equal(payload);

            const serviceOrderTurn = await ServiceOrderTurn.query()
                .where({
                    serviceOrderId: serviceOrder.id,
                    turnId: turn.id,
                })
                .first();

            expect(serviceOrderTurn).to.not.exist;
        });

        it('should reject if invalid args were passed', async () => {
            await expect(createServiceOrderTurns()).to.be.rejected;
            await expect(createServiceOrderTurns(null)).to.be.rejected;
        });
    });

    describe('test createOrderForTurn', () => {
        it('should create an order', async () => {
            const turn = await factory.create(FACTORIES_NAMES.turn),
                store = await factory.create(FACTORIES_NAMES.store);

            const payload = {
                turnId: turn.id,
                machineDetails: {
                    storeId: store.id,
                },
            };

            const result = await createOrderForTurn(payload);

            const orderInDb = await Order.query()
                .where({
                    storeId: payload.machineDetails.storeId,
                    orderableId: payload.turnId,
                })
                .first();

            expect(orderInDb).to.exist;
            expect(result).to.deep.equal({
                orderId: orderInDb.id,
                turnId: turn.id,
                machineDetails: {
                    storeId: store.id,
                },
            })
        });

        it('should reject if invalid args were passed', async () => {
            await expect(createOrderForTurn()).to.be.rejected;
            await expect(createOrderForTurn({})).to.be.rejected;
            await expect(createOrderForTurn(null)).to.be.rejected;
        });
    });
});
