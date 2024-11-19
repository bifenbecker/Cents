require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { expect } = require('../../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const addWeightLog = require('../../../../../../uow/order/serviceOrder/adjustOrder/addWeightLog');
const serviceOrderWeights = require('../../../../../../models/serviceOrderWeights');

describe('test addWeightLog UOW', () => {
    let store, serviceOrder;
    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
    });

    it('should return payload if it is empty', async () => {
        const result = await addWeightLog({});
        expect(result).to.be.empty;
    });


    it('should return payload if it is empty', async () => {
        const payload = { 
            totalWeight: 20,
            status: 'STATUS',
            chargeableWeight: 10,
            serviceOrderId: serviceOrder.id,
        }
        const result = await addWeightLog(payload);
        const weightLog = await serviceOrderWeights.query().select('*').findOne({
            serviceOrderId: serviceOrder.id,
        });

        expect(result).to.include(payload);
        expect(weightLog).to.include(payload);
    });
});
