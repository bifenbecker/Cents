const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const editCustomerPipeline = require('../../../../pipeline/customer/editCustomerPipeline');

describe('test editCustomerPipeline', () => {
    let centsCustomer, payload, store;

    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer', { firstName: 'John' });
        store = await factory.create('store');
        await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });

        payload = {
            fullName: 'Mister Tester',
            firstName: 'Mister',
            lastName: 'Tester',
            centsCustomerId: centsCustomer.id,
            phoneNumber: centsCustomer.phoneNumber,
        };
    });

    it('should call UoWs and expected payload', async () => {
        const inputPayload = {...payload};
        const outputPayload = await editCustomerPipeline(inputPayload);

        // validate editCentsCustomerUoW is invoked and payload data is correct
        expect(outputPayload).to.be.equal(inputPayload);
        expect(outputPayload.centsCustomer.id).to.satisfy(Number.isInteger);
        expect(outputPayload.centsCustomer.createdAt).to.be.a.dateString();
        expect(outputPayload.centsCustomer.updatedAt).to.be.a.dateString();
        expect(outputPayload.centsCustomer.firstName).to.equal(payload.firstName);
        expect(outputPayload.centsCustomer.lastName).to.equal(payload.lastName);
        expect(outputPayload.centsCustomer.phoneNumber).to.equal(payload.phoneNumber);

        // validate editChildStoreCustomerUoW is invoked and payload data is correct
        expect(outputPayload.storeCustomers.length).to.equal(1);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(editCustomerPipeline()).to.be.rejected;
        await expect(editCustomerPipeline(null)).to.be.rejected;
        await expect(editCustomerPipeline({})).to.be.rejected;
    });
});
