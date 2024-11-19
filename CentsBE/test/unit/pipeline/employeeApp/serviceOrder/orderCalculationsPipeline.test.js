require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const orderCalculationsPipeline = require('../../../../../pipeline/employeeApp/serviceOrder/orderCalculationsPipeline');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test orderCalculationsPipeline', () => {
    let centsCustomer, store;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomer = await factory.create(FN.centsCustomer);
    });

    it('should return expected result', async () => {
        const payload = {
            store,
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            orderItems: [],
            status: 'READY_FOR_PROCESSING',
            skipPerPoundChargeableWeightValidation: true
        };
        const result = await orderCalculationsPipeline(payload);

        expect(result.orderItems).to.be.empty;
        expect(result.orderId).to.be.undefined;
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(orderCalculationsPipeline()).to.be.rejected;
        await expect(orderCalculationsPipeline(null)).to.be.rejected;
        await expect(orderCalculationsPipeline({})).to.be.rejected;
    });
});
