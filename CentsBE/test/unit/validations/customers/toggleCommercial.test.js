const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { ERROR_MESSAGES } = require('../../../../constants/error.messages');
const { USER_TYPES } = require('../../../../constants/constants');
const { createMiddlewareMockedArgs } = require('../../../support/mockers/createMiddlewareMockedArgs');
const toggleCommercialCustomerValidator = require('../../../../validations/customers/toggleCommercial');

const getApiEndpoint = (centsCustomerId) => {
    return `/api/v1/business-owner/customers/${centsCustomerId}/toggle-commercial`;
};

describe('test toggleCommercial', function () {
    it('should call next if something completes with error', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs();
  
        await toggleCommercialCustomerValidator(mockedReq, mockedRes, mockedNext);

        expectedNextCall((error) => {
            expect(error).to.have.property('message');
        });
    });

    it('should throw 422 when the customer id is less than 1', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            params: { id: 0 },
        });
  
        await toggleCommercialCustomerValidator(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, response => {
            expect(response).to.have.property('error', '"id" must be larger than or equal to 1');
        });
    });

    it('should throw 422 when the \'isCommercial\' field is missed', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            params: { id: 1 },
        });
  
        await toggleCommercialCustomerValidator(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, response => {
            expect(response).to.have.property('error', '"isCommercial" is required');
        });
    });

    describe('with right parameter and body', () => {
        let centsCustomer, laundromatBusiness;

        beforeEach(async () => {
            const user = await factory.create(FN.userWithBusinessOwnerRole);

            laundromatBusiness = await factory.create(FN.laundromatBusiness, {
                userId: user.id,
            });

            centsCustomer = await factory.create(FN.centsCustomer);
        });

        it('should throw 404 if businessCustomer is not found', async () => {
            
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
                params: { id: centsCustomer.id },
                currentUser: {
                    getBusiness: () => laundromatBusiness,
                    role: USER_TYPES.BUSINESS_OWNER,
                },
                body: { isCommercial: false },
            });
      
            await toggleCommercialCustomerValidator(mockedReq, mockedRes, mockedNext);
    
            expectedResponseCall(404, response => {
                expect(response).to.have.property('error', ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
            });
        });

        it('should succesfully validate request body', async () => {            
            const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
                params: { id: centsCustomer.id },
                currentUser: {
                    getBusiness: () => laundromatBusiness,
                    role: USER_TYPES.BUSINESS_OWNER,
                },
                body: { isCommercial: false },
            });

            await factory.create(FN.businessCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: laundromatBusiness.id,
            });
      
            await toggleCommercialCustomerValidator(mockedReq, mockedRes, mockedNext);
    
            expectedNextCall();
        });
    });
});
