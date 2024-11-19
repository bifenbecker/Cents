require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { statuses } = require('../../../../../constants/constants');
const updateStatusAndNotes = require('../../../../../uow/order/serviceOrder/updateStatusAndNotes');

const payloadSample = { 
    rack: 'UPDATED_RACK',
    notes: 'UPDATED_NOTES',
    status: statuses.COMPLETED,
};

describe('test updateStatusAndNotes UOW', () => {
    let store, serviceOrder;
    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            updatedAt: new Date().toISOString(),
        })
    });

    it('should fail when payload is empty', async () => {
        await expect(updateStatusAndNotes({})).to.be.rejected;
    });

    it(`should fail when serviceOrderId is not passed`, async () => {
        await expect(updateStatusAndNotes({
            ...payloadSample,
        })).to.be.rejected;
    });

    it('should update serviceOrder and return payload', async () => {
        const result = await updateStatusAndNotes({
            ...payloadSample,
            serviceOrderId: serviceOrder.id,
        });

        expect(result).to.include(payloadSample);
        expect(result.serviceOrder.id).to.equal(serviceOrder.id);
        expect(result.serviceOrder).to.include(payloadSample);
    });
});
