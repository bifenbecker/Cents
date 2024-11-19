require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const editChildStoreCustomer = require('../../../../uow/customer/editChildStoreCustomerUow');
const StoreCustomer = require('../../../../models/storeCustomer');
const CentsCustomer = require('../../../../models/centsCustomer');

describe('test edit store customer uow', () => {
    let centsCustomer, store;
    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer');
        store = await factory.create('store');
    });
    it('should update store customers for the cents customer', async () => {
        //arrange

        await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });

        const updatedCentsCustomer = await CentsCustomer.query().updateAndFetchById(
            centsCustomer.id,
            { firstName: 'Mister' },
        );

        const payload = {
            centsCustomerId: centsCustomer.id,
            centsCustomer: updatedCentsCustomer,
        };

        // act
        const res = await editChildStoreCustomer(payload);

        // assert
        expect(res.storeCustomers.length).to.equal(1);
        const updatedStoreCustomer = await StoreCustomer.query().findOne({
            centsCustomerId: centsCustomer.id,
        });
        expect(updatedStoreCustomer.firstName).to.equal('Mister');
    });
});
