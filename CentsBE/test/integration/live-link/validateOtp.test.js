require('../../testHelper');
const sinon = require('sinon');
const Redis = require('ioredis');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const JwtService = require('../../../services/tokenOperations/main');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/verify-otp';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const body = {
        phoneNumber: '1234567891',
        otp: '123456',
    };
    it('should return correct response when body and relations are valid', async () => {
        const { centsCustomer } = await createUserWithBusinessAndCustomerOrders(
            { createPartnerSubsidiary: false },
            {
                centsCustomer: {
                    phoneNumber: '1234567891',
                },
            },
        );

        sinon.stub(Redis.prototype, 'get').returns(body.otp);
        const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('isNew').to.be.false;
        expect(response.body).to.have.property('customer').to.be.eql({
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
        });
        expect(response.body).to.have.property('customerAuthToken').to.not.be.empty;
        expect(response.body).to.have.property('latestOrderToken').to.not.be.empty;
    });

    it('should return correct response when the phoneNumber is new', async () => {
        sinon.stub(Redis.prototype, 'get').returns(body.otp);
        const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('isNew').to.be.true;
    });

    it('should return correct response when customer does not have any orders', async () => {
        const centsCustomer = await factory.create(FN.centsCustomer, {
            phoneNumber: '1234567891',
        });

        sinon.stub(Redis.prototype, 'get').returns(body.otp);
        const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('isNew').to.be.false;
        expect(response.body).to.have.property('customer').to.be.eql({
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
        });
        expect(response.body).to.have.property('customerAuthToken').to.not.be.empty;
        expect(response.body).to.have.property('latestOrderToken').to.be.equal('');
    });

    it('should return res with status 403 when otp is invalid', async () => {
        sinon.stub(Redis.prototype, 'get').returns('654321');
        const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

        response.should.have.status(403);
        expect(response.body).to.have.property('error').to.be.equal('Invalid code.');
    });

    it('should return res with status 404 when order not found', async () => {
        sinon.stub(Redis.prototype, 'get').throws(Error('ORDER_NOT_FOUND'));
        const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

        response.should.have.status(404);
        expect(response.body).to.have.property('error').to.be.equal('Order not found.');
    });

    it('should call next(error) with Unexpected error', async () => {
        await createUserWithBusinessAndCustomerOrders(
            { createPartnerSubsidiary: false },
            {
                centsCustomer: {
                    phoneNumber: '1234567891',
                },
            },
        );

        const unexpectedError = 'Something went wrong!';

        sinon.stub(Redis.prototype, 'get').returns(body.otp);
        sinon.stub(JwtService.prototype, 'tokenGenerator').throws(unexpectedError);
        const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

        response.should.have.status(500);
        expect(response.body).to.have.property('error').to.be.equal(unexpectedError);
    });
});
