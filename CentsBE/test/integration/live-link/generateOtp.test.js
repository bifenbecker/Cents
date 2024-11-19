require('../../testHelper');
const sinon = require('sinon');
const twilioClient = require('../../../utils/sms/index');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const CentsCustomer = require('../../../models/centsCustomer');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/request-otp';
const apiEndpoint = `/api/v1/${endpointName}`;
const validPhoneNumber = '1234567891';

const makeRequest = async ({ phoneNumber, storeId, isAuthorized }) => {
    const response = await ChaiHttpRequestHelper.post(
        apiEndpoint,
        {},
        {
            phoneNumber,
            storeId,
            isAuthorized,
        },
    );

    return response;
};

const makeErrorRequest = async ({
    expectedStatusCode,
    expectedErrorMessage,
    stubbedErrorMessage,
}) => {
    sinon.stub(CentsCustomer, 'query').throws(new Error(stubbedErrorMessage));

    const response = await makeRequest({
        storeId: undefined,
        phoneNumber: validPhoneNumber,
        isAuthorized: true,
    });

    response.should.have.status(expectedStatusCode);
    expect(response.body).to.have.property('error').to.be.equal(expectedErrorMessage);
};

describe(`test ${apiEndpoint} API Endpoint`, () => {
    it('should return correct response when relations are valid', async () => {
        const store = await factory.create(FN.store, {
            type: 'RESIDENTIAL',
        });
        const partnerSubsidiary = await factory.create(FN.partnerSubsidiary, {
            subsidiaryCode: 111111,
            type: 'RESIDENTIAL',
        });
        await factory.create(FN.partnerSubsidiaryStore, {
            storeId: store.id,
            partnerSubsidiaryId: partnerSubsidiary.id,
        });
        const centsCustomer = await factory.create(FN.centsCustomer, {
            phoneNumber: validPhoneNumber,
        });
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            phoneNumber: centsCustomer.phoneNumber,
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
        });

        const response = await makeRequest({
            storeId: store.id,
            phoneNumber: storeCustomer.phoneNumber,
            isAuthorized: true,
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body)
            .to.have.property('phoneNumber')
            .to.be.equal(storeCustomer.phoneNumber);
        expect(response.body).to.have.property('customer').to.be.eql({
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
        });
        expect(response.body)
            .to.have.property('otpCode')
            .to.be.equal(partnerSubsidiary.subsidiaryCode);
    });

    it('should return correct response when relations are valid and isAuthorized equals to false', async () => {
        const store = await factory.create(FN.store, {
            type: 'RESIDENTIAL',
        });
        const partnerSubsidiary = await factory.create(FN.partnerSubsidiary, {
            subsidiaryCode: 111111,
            type: 'RESIDENTIAL',
        });
        await factory.create(FN.partnerSubsidiaryStore, {
            storeId: store.id,
            partnerSubsidiaryId: partnerSubsidiary.id,
        });
        const centsCustomer = await factory.create(FN.centsCustomer, {
            phoneNumber: validPhoneNumber,
        });
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            phoneNumber: centsCustomer.phoneNumber,
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
        });

        const twilioSpy = sinon.stub(twilioClient.messages, 'create').returns(true);

        const response = await makeRequest({
            storeId: store.id,
            phoneNumber: storeCustomer.phoneNumber,
            isAuthorized: false,
        });

        response.should.have.status(200);
        sinon.assert.calledOnce(twilioSpy);

        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body)
            .to.have.property('phoneNumber')
            .to.be.equal(storeCustomer.phoneNumber);
        expect(response.body).to.have.property('customer').to.be.eql({
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
        });
        expect(response.body)
            .to.have.property('otpCode')
            .to.be.equal(partnerSubsidiary.subsidiaryCode);
    });

    it('should return response without customer credentials', async () => {
        const response = await makeRequest({
            storeId: undefined,
            phoneNumber: validPhoneNumber,
            isAuthorized: true,
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('customer').to.be.eql({
            firstName: '',
            lastName: '',
        });
        expect(response.body).to.have.property('phoneNumber').to.be.equal(validPhoneNumber);
        expect(response.body)
            .to.have.property('otpCode')
            .to.satisfy(Number.isInteger)
            .that.is.above(100000)
            .and.below(1000000);
    });

    it('should catch error CUSTOMER_NOT_FOUND and send 404 response', async () => {
        await makeErrorRequest({
            expectedStatusCode: 404,
            expectedErrorMessage: 'Customer not found.',
            stubbedErrorMessage: 'CUSTOMER_NOT_FOUND',
        });
    });

    it('should catch unprovided error with status 500', async () => {
        await makeErrorRequest({
            expectedStatusCode: 500,
            expectedErrorMessage: 'Unprovided error',
            stubbedErrorMessage: 'Unprovided error',
        });
    });
});
