require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const { createCustomerWithAddress } = require('../../../../support/customerAddressHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const createCustomerValidator = require('../../../../../validations/liveLink/customer/add');

async function checkForResponseError({ body, statusCode }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await createCustomerValidator(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await createCustomerValidator(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    expect(mockedReq.body).to.have.keys([
        'fullName',
        'phoneNumber',
    ]);
}

describe('test createCustomerValidator validation', () => {
    let req;

    beforeEach(async () => {
        const { centsCustomer } = await createCustomerWithAddress();

        req = {
            body: {
                fullName: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
                phoneNumber: '8484884899',
            }
        };
    });

    it('should pass the validation when body payload is valid', async () => {
        await checkForSuccessValidation(req);
    });

    it('should not pass the validation when payload.phoneNumber is equal to centsCustomer.phoneNumber', async () => {
        const { centsCustomer } = await createCustomerWithAddress();

        req.body.phoneNumber = centsCustomer.phoneNumber;

        await checkForResponseError({
            ...req,
            statusCode: 409,
        });
    });

    it('should throw an error when there is no body payload', async () => {
        const body = undefined;
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        await createCustomerValidator(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should not pass the validation when phoneNumber is undefined', async () => {
        req.body.phoneNumber = undefined;

        await checkForResponseError({
            ...req,
            statusCode: 422,
        });
    });
}); 