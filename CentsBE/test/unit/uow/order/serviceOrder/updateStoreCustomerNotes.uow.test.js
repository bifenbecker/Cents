require('../../../../testHelper');
const StoreCustomer = require('../../../../../models/storeCustomer');
const updateStoreCustomerNotes = require('../../../../../uow/customer/updateNotes');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test updateStoreCustomerNotes UOW', () => {
    let store, payload;

    beforeEach(async () => {
        store = await factory.create('store');

        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });

        payload = {
            status: 'READY_FOR_PROCESSING',
            storeCustomerId: storeCustomer.id,
        };
    });

    it('should be able to update storeCustomer notes if sent', async () => {
        payload.customerNotes = 'test notes update';
        const result = await updateStoreCustomerNotes(payload);
        const storeCustomer = await StoreCustomer.query()
            .where('id', payload.storeCustomerId)
            .first();
        expect(storeCustomer).to.have.property('notes').equal(payload.customerNotes);
    });
});
