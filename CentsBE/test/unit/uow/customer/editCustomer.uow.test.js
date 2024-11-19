require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const editCentsCustomer = require('../../../../uow/customer/editCentsCustomerUow');
const factory = require('../../../factories');
const CentsCustomer = require('../../../../models/centsCustomer');

describe('test edit cents customer uow', () => {
    let centsCustomer, payload;
    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer', { firstName: 'John' });
        payload = {
            fullName: 'Mister Tester',
            firstName: 'Mister',
            lastName: 'Tester',
            centsCustomerId: centsCustomer.id,
            phoneNumber: centsCustomer.phoneNumber,
        };
    });

    it('should update cents customer', async () => {
        const res = await editCentsCustomer(payload);
        expect(res.centsCustomer.firstName).to.equal('Mister');
        expect(res.centsCustomer.lastName).to.equal('Tester');
    });

    it('should fail to update cents customer', async () => {
        const centsCustomer2 = await factory.create('centsCustomer');

        payload.phoneNumber = centsCustomer2.phoneNumber;
        expect(editCentsCustomer(payload)).rejectedWith(Error);
        const centsCustomer1 = await CentsCustomer.query().findById(centsCustomer.id);
        expect(centsCustomer1.firstName).to.equal('John');
    });
});
