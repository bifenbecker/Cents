require('../../testHelper');
const sinon = require('sinon');
const { transaction } = require('objection');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../support/apiTestHelper');
const StoreCustomer = require('../../../models/storeCustomer');
const eventEmitter = require('../../../config/eventEmitter');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/customer-store/:businessId';
const apiEndpoint = `/api/v1/${endpointName}`;

const body = {
    notes: 'test notes',
};

const makeRequest = async ({ businessId, centsCustomerId }) => {
    const customerauthtoken = generateLiveLinkCustomerToken({
        id: centsCustomerId,
    });

    const currentApiEndpoint = apiEndpoint.replace(':businessId', businessId);

    const response = await ChaiHttpRequestHelper.patch(currentApiEndpoint, {}, body).set({
        customerauthtoken,
    });

    return response;
};

describe(`test ${apiEndpoint} API endpoint`, () => {
    it('should successfully patch the StoreCustomer', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        const eventEmitterSpy = sinon.spy(eventEmitter, 'emit');

        const trx = await transaction.start(StoreCustomer.knex());
        const commitSpy = sinon.spy(trx, 'commit');
        sinon.stub(transaction, 'start').returns(trx);

        const response = await makeRequest({
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });
        const updatedStoreCustomer = await StoreCustomer.query()
            .findById(storeCustomer.id)
            .returning('*');

        response.should.have.status(201);
        expect(updatedStoreCustomer.notes)
            .to.be.equal(body.notes)
            .and.to.not.be.equal(storeCustomer.notes);

        expect(eventEmitterSpy.calledWith('indexCustomer', storeCustomer.id));
        expect(eventEmitterSpy.calledOnce).to.be.true;
        expect(commitSpy.calledOnce).to.be.true;
    });

    it('should return response 422 when did not find the StoreCustomer', async () => {
        const centsCustomer = await factory.create(FN.centsCustomer);

        const eventEmitterSpy = sinon.spy(eventEmitter, 'emit');

        const trx = await transaction.start(StoreCustomer.knex());
        const rolSpy = sinon.spy(trx, 'rollback');
        sinon.stub(transaction, 'start').returns(trx);

        const response = await makeRequest({
            businessId: 0,
            centsCustomerId: centsCustomer.id,
        });

        response.should.have.status(422);
        expect(response.body)
            .to.have.property('error')
            .to.be.equal(
                `Failed to patch store-customer entity with businessId 0 and centsCustomerId ${centsCustomer.id}`,
            );
        expect(eventEmitterSpy.notCalled).to.be.true;
        expect(rolSpy.called).to.be.true;
    });

    it('should call next(e) when catch the exception', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        const errorMessage = 'unexpected error';
        sinon.stub(StoreCustomer, 'query').throws(new Error(errorMessage));

        const response = await makeRequest({
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        sinon.restore();
        const newStoreCustomer = await StoreCustomer.query()
            .findById(storeCustomer.id)
            .returning('*');

        response.should.have.status(500);
        expect(response.body, 'should contain error with errorMessage')
            .to.have.property('error')
            .to.be.equal(errorMessage);

        expect(newStoreCustomer.notes, 'should not apply any changes')
            .to.not.be.equal(body.notes)
            .and.to.be.equal(storeCustomer.notes);
    });
});
