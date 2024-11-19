const updatePaymentStatementDescriptorValidation = require('../../../../../validations/stripe/account/updatePaymentStatementDescriptor');
const { createMiddlewareMockedArgs } = require('../../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../../support/chaiHelper');

describe('test updatePaymentStatementDescriptor validation', () => {
    it('should succesfully validate request body', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            body: {
                id: 'test_id',
                value: 'testValue',
            }
        });

        await updatePaymentStatementDescriptorValidation(mockedReq, mockedRes, mockedNext);

        expectedNextCall();
    });

    it('should have status 422 status if "id" is missing', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            body: {
                value: 'testValue',
            }
        });
  
        await updatePaymentStatementDescriptorValidation(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, response => {
            expect(response).to.have.property('error', 'child "id" fails because ["id" is required]');
        });
    });

    it('should have status 422 status if "value" is missing', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            body: {
                id: 'test_id',
            }
        });
  
        await updatePaymentStatementDescriptorValidation(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, response => {
            expect(response).to.have.property('error', 'child "value" fails because ["value" is required]');
        });
    });

    it('should have status 422 status if "value" length is less than 5', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            body: {
                id: 'test_id',
                value: 'test',
            }
        });
  
        await updatePaymentStatementDescriptorValidation(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, response => {
            expect(response).to.have.property('error', 'child "value" fails because ["value" length must be at least 5 characters long]');
        });
    });

    it('should have status 422 status if "value" length is greater than 22', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            body: {
                id: 'test_id',
                value: 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest',
            }
        });
  
        await updatePaymentStatementDescriptorValidation(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, response => {
            expect(response).to.have.property('error', 'child "value" fails because ["value" length must be less than or equal to 22 characters long]');
        });
    });
});
