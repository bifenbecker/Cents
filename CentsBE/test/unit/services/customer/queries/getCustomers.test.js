require('../../../../testHelper');
const factory = require('../../../../factories');
const { getCustomers } = require('../../../../../services/queries/customerQueries');
const { expect } = require('../../../../support/chaiHelper');

describe('Get customer details', () => {
    let laundromatBusiness, centsCustomer, store, storeCustomer;
    
    beforeEach(async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        centsCustomer = await factory.create('centsCustomer');
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: laundromatBusiness.id,
            centsCustomerId: centsCustomer.id,
        });
    });

    it('should return correct customer details', async () => {
        const queryRes = await getCustomers(
            store.id,
            laundromatBusiness.id,
            centsCustomer.id,
            null,
        );
        
        expect(queryRes)
            .to.have.property('fullName')
            .to.equal(`${centsCustomer.firstName} ${centsCustomer.lastName}`);
        expect(queryRes).to.have.property('firstName').to.equal(centsCustomer.firstName);
        expect(queryRes).to.have.property('lastName').to.equal(centsCustomer.lastName);
        expect(queryRes).to.have.property('phoneNumber').to.equal(centsCustomer.phoneNumber);
        expect(queryRes).to.have.property('email').to.equal(centsCustomer.email);
        expect(queryRes).to.have.property('languageId').to.equal(centsCustomer.languageId);
        expect(queryRes).to.have.property('isCommercial', false);
        expect(queryRes).to.have.property('isInvoicingEnabled', false);
    });

    it('should return total count of founded customers', async () => {
        const queryRes = await getCustomers(
            store.id,
            laundromatBusiness.id,
            centsCustomer.id,
            null,
            true,
        );
        
        expect(queryRes).to.have.property('totalCount').to.equal('1');
    });

    it('should return last 10 entries', async () => {
        storeCustomer = await factory.createMany('storeCustomer', 50, {
            storeId: store.id,
            businessId: laundromatBusiness.id,
            centsCustomerId: centsCustomer.id,
        });
        const page = 5;
        const queryRes = await getCustomers(store.id, laundromatBusiness.id, null, page);
        
        expect(queryRes.length).to.be.equal(10);
    });

    it('should limit query result to 10 entries', async () => {
        storeCustomer = await factory.createMany('storeCustomer', 50, {
            storeId: store.id,
            businessId: laundromatBusiness.id,
            centsCustomerId: centsCustomer.id,
        });
        const page = 3;
        const queryRes = await getCustomers(store.id, laundromatBusiness.id, null, page);
        expect(queryRes.length).to.be.equal(10);
    });
});
