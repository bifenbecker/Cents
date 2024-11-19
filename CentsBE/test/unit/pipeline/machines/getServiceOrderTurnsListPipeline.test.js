require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getServiceOrderTurnList = require('../../../../pipeline/machines/getServiceOrderTurnsListPipeline');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test getServiceOrderTurnsListPipeline', () => {
    let serviceOrder, serviceOrderTurn;

    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder);
        serviceOrderTurn = await factory.create(FN.serviceOrderTurns, {
            serviceOrderId: serviceOrder.id,
        });
    });

    it('should return result successfully', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
            type: 'WASHER',
        };
        const result = await getServiceOrderTurnList(payload);
        expect(result.length).to.eq(1);
        expect(result[0].status).to.eq('COMPLETED');
        expect(result[0].machine.type).to.eq('W');
        expect(result[0].quantity).to.eq(0);
    });

    it('should throw an error in pipeline if serviceOrder is not found', async () => {
        const serviceOrderId = ++serviceOrder.id;
        const payload = {
            serviceOrderId,
            type: 'WASHER',
        };
        await expect(getServiceOrderTurnList(payload)).to.be.rejectedWith('Invalid serviceOrder id.');
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getServiceOrderTurnList()).to.be.rejected;
        await expect(getServiceOrderTurnList(null)).to.be.rejected;
        await expect(getServiceOrderTurnList({})).to.be.rejected;
    });
});