require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const createCentsCustomer = require('../../../../uow/customer/createCentsCustomer');
const CentsCustomer = require('../../../../models/centsCustomer');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test create cents customer uow', () => {
    let centsCustomer, payload;

    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        payload = {
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            phoneNumber: centsCustomer.phoneNumber,
        };
    });

    it('should return a cents customer if phoneNumber already exists', async () => {
        const res = await createCentsCustomer(payload);

        expect(res.centsCustomer.firstName).to.equal(centsCustomer.firstName);
        expect(res.centsCustomer.lastName).to.equal(centsCustomer.lastName);
        expect(res.centsCustomer.phoneNumber).to.equal(centsCustomer.phoneNumber);
    });

    it('should fail to create a cents customer for not passing the payload', async () => {
        payload = {}
        expect(createCentsCustomer(payload)).rejectedWith(Error);
    });

    it('should find a cents customer by id after creating', async () => {
        const centsCustomerQuery = await CentsCustomer.query().findById(centsCustomer.id);

        expect(centsCustomerQuery.firstName).to.equal(centsCustomer.firstName);
        expect(centsCustomerQuery.lastName).to.equal(centsCustomer.lastName);
        expect(centsCustomerQuery.phoneNumber).to.equal(centsCustomer.phoneNumber);
    });

    it('should create a cents customer', async () => {
        const newPayload = {
            firstName: 'Ben',
            lastName: 'Test',
            phoneNumber: 123456,
        };
        const res = await createCentsCustomer(newPayload);
        const foundCustomer = await CentsCustomer.query().findOne({ phoneNumber: newPayload.phoneNumber });

        expect(foundCustomer).to.exist;
        expect(res.centsCustomer.firstName).to.equal(foundCustomer.firstName);
        expect(res.centsCustomer.lastName).to.equal(foundCustomer.lastName);
        expect(res.centsCustomer.phoneNumber).to.equal(foundCustomer.phoneNumber);
        expect(res.centsCustomer).should.not.equal(undefined);
        expect(res.centsCustomer).should.not.equal(null);
    });
});