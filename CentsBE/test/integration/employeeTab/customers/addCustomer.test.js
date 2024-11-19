require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const CentsCustomer = require('../../../../models/centsCustomer');
const { expect } = require('../../../support/chaiHelper');

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

async function createStoreCustomer() {
    const store = await factory.create('store');
    const storeCustomer = await factory.create('storeCustomer', {
        storeId: store.id,
        businessId: store.businessId,
    });
    const token = await getToken(storeCustomer.storeId);
    return { storeCustomer, token };
}

describe('test cents customer api', () => {
    describe('test customer create api', () => {
        const apiEndPoint = '/api/v1/employee-tab/customers';

        it('should throw an error if token is not sent', async () => {
            // arrange
            const centsCustomer = await factory.build('centsCustomer');
            // act
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, centsCustomer).set(
                'authtoken',
                '',
            );
            // assert
            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const centsCustomer = await factory.build('centsCustomer', {}, { fullName: true });
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, centsCustomer).set(
                'authtoken',
                token,
            );
            res.should.have.status(403);
        });

        it('should thrown an error for duplicate email', async () => {
            const { storeCustomer, token } = await createStoreCustomer();

            const newCentsCustomer = await factory.build(
                'centsCustomer',
                {
                    email: storeCustomer.email,
                },
                { fullName: true, removePassword: true },
            );

            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, newCentsCustomer).set(
                'authtoken',
                token,
            );
            res.should.have.status(409);
            res.body.should.have.property('error').to.equal('Email already exists.');
        });

        it('should thrown an error for duplicate phoneNumber', async () => {
            const { storeCustomer, token } = await createStoreCustomer();

            const newCentsCustomer = await factory.build(
                'centsCustomer',
                {
                    phoneNumber: storeCustomer.phoneNumber,
                },
                { fullName: true, removePassword: true },
            );

            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, newCentsCustomer).set(
                'authtoken',
                token,
            );

            res.should.have.status(409);
            res.body.should.have.property('error').to.equal('Phone number already exists.');
        });

        it('should create a cents customer successfully', async () => {
            const store = await factory.create('store');
            const token = await getToken(store.id);
            const centsCustomer = await factory.build(
                'centsCustomer',
                {},
                { fullName: true, removePassword: true },
            );
            const beforeCount = await CentsCustomer.query().count();
            expect(Number(beforeCount[0].count)).equal(0);

            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, centsCustomer).set(
                'authtoken',
                token,
            );
            res.should.have.status(200);

            const afterCount = await CentsCustomer.query().count();
            expect(Number(afterCount[0].count)).greaterThan(0);
            expect(res.body.details).to.have.property('id');
        });

        it('should update a store customer successfully', async () => {
            const store = await factory.create('store');
            const token = await getToken(store.id);
            const centsCustomer = await factory.create('centsCustomer');
            const newCentsCustomer = await factory.build(
                'centsCustomer',
                {
                    phoneNumber: centsCustomer.phoneNumber,
                    email: centsCustomer.email,
                },
                { fullName: true, removePassword: true },
            );

            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, newCentsCustomer).set(
                'authtoken',
                token,
            );
            res.should.have.status(200);
            expect(res.body.details).to.have.property('id');
            expect(res.body.details.id).to.equal(centsCustomer.id);
        });
    });
});
