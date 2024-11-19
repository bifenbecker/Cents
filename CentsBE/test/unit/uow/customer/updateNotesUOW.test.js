require('../../../testHelper');
const { transaction } = require('objection');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const updateNotes = require('../../../../uow/customer/updateNotes');
const StoreCustomer = require('../../../../models/storeCustomer');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const updateStoreCustomer = async (payload) => {
    await updateNotes(payload);
    await payload.transaction.commit();
    const updatedCustomer = await StoreCustomer.query()
        .findById(payload.storeCustomerId)
        .returning('*');
    return updatedCustomer;
}

describe('test updateNotes', () => {
    let storeCustomer, store, trx;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            isHangDrySelected: true,
            notes: 'NOTES',
            hangDryInstructions: 'INSTRUCTIONS',
        });
        trx = await transaction.start(StoreCustomer.knex());
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(updateStoreCustomer()).to.be.rejected;
        await expect(updateStoreCustomer(null)).to.be.rejected;
    });

    it('should update storeCustomer notes', async () => {
        const payload = {
            storeCustomerId: storeCustomer.id,
            transaction: trx,
            customerNotes: 'new notes',
            isHangDrySelected: false,
            hangDryInstructions: null,
        };
        const updatedCustomer = await updateStoreCustomer(payload);
        expect(updatedCustomer.id).to.equal(storeCustomer.id);
        expect(updatedCustomer.notes).to.equal(payload.customerNotes);
        expect(updatedCustomer.isHangDrySelected).to.equal(payload.isHangDrySelected);
        expect(updatedCustomer.hangDryInstructions).to.equal(payload.hangDryInstructions);
    });

    it('should update storeCustomer notes when customerNotes is null', async () => {
        const payload = {
            storeCustomerId: storeCustomer.id,
            transaction: trx,
            customerNotes: null,
            isHangDrySelected: false,
            hangDryInstructions: null,
        };
        const updatedCustomer = await updateStoreCustomer(payload);
        expect(updatedCustomer.id).to.equal(storeCustomer.id);
        expect(updatedCustomer.notes).to.equal(payload.customerNotes);
        expect(updatedCustomer.isHangDrySelected).to.equal(payload.isHangDrySelected);
        expect(updatedCustomer.hangDryInstructions).to.equal(payload.hangDryInstructions);
    });

    it(`shouldn't update storeCustomer notes when some fields are undefined`, async () => {
        const payload = {
            storeCustomerId: storeCustomer.id,
            transaction: trx,
        };
        const updatedCustomer = await updateStoreCustomer(payload);
        expect(updatedCustomer.id).to.equal(storeCustomer.id);
        expect(updatedCustomer.notes).to.equal(storeCustomer.notes);
        expect(updatedCustomer.isHangDrySelected).to.equal(storeCustomer.isHangDrySelected);
        expect(updatedCustomer.hangDryInstructions).to.equal(storeCustomer.hangDryInstructions);
    });
});