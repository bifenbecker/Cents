require('../../../../testHelper');
const {
    createTurnLineItemUow,
} = require('../../../../../uow/machines/runMachine/createTurnLineItemUow');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const TurnLineItem = require('../../../../../models/turnLineItems');

describe('test createTurnLineItemUow', () => {
    let turn;

    beforeEach(async () => {
        turn = await factory.create(FACTORIES_NAMES.turn);
    });

    it('should create an turn line item for a washer machine', async () => {
        const payload = {
            turnId: turn.id,
            machineDetails: {
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 11,
                    },
                ],
                turnTimeInMinutes: 5,
            },
            quantity: 12,
        };

        const result = await createTurnLineItemUow(payload);
        expect(result).to.equal(payload);

        const turnLineItemInDb = await TurnLineItem.query()
            .where({
                turnId: payload.turnId,
            })
            .first();

        expect(turnLineItemInDb).to.exist;
        expect(turnLineItemInDb).to.include({
            quantity: 1,
            unitPriceInCents: payload.machineDetails.machinePricings[0].price,
        });
    });

    it('should create an turn line item for a dryer machine', async () => {
        const payload = {
            turnId: turn.id,
            machineDetails: {
                model: {
                    machineType: {
                        name: 'DRYER',
                    },
                },
                machinePricings: [
                    {
                        price: 11,
                    },
                ],
                turnTimeInMinutes: 5,
            },
            quantity: 12,
        };

        const result = await createTurnLineItemUow(payload);
        expect(result).to.equal(payload);

        const turnLineItemInDb = await TurnLineItem.query()
            .where({
                turnId: payload.turnId,
            })
            .first();

        expect(turnLineItemInDb).to.exist;
        expect(turnLineItemInDb).to.include({
            quantity: 12,
            unitPriceInCents: payload.machineDetails.machinePricings[0].price,
            turnTime: '60',
        });
    });

    it('should reject if invalid args were passed', async () => {
        await expect(createTurnLineItemUow()).to.be.rejected;
        await expect(createTurnLineItemUow({})).to.be.rejected;
        await expect(createTurnLineItemUow(null)).to.be.rejected;
    });
});
