require('../../../../../testHelper');
const faker = require('faker');
const createOwnNetworkReturnDeliveryValidation = require('../../../../../../validations/liveLink/delivery/return/createOwnNetworkReturnDelivery');
const factory = require('../../../../../factories');
const { createCustomerWithAddress } = require('../../../../../support/customerAddressHelper');
const {
    createOrderDeliveryAndRelatedEntities,
} = require('../../../../../support/createOrderDeliveryHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');

async function checkForResponseError({ body, statusCode }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await createOwnNetworkReturnDeliveryValidation(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await createOwnNetworkReturnDeliveryValidation(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    expect(mockedReq.constants).to.have.keys([
        'order',
        'storeCustomer',
        'serviceOrder',
        'customer',
        'store',
    ]);
}

describe('test createOwnNetworkReturnDelivery validation', () => {
    let sampleBody;
    beforeEach(async () => {
        const { centsCustomer, storeCustomer, store, centsCustomerAddress } =
            await createCustomerWithAddress();
        const timings = await factory.create(FN.timing);
        const { serviceOrder } = await createOrderDeliveryAndRelatedEntities(store, storeCustomer);
        const paymentMethod = await factory.create(FN.paymentMethod, {
            centsCustomerId: centsCustomer.id,
        });

        sampleBody = {
            address: centsCustomerAddress,
            centsCustomerId: centsCustomer.id,
            deliveryCost: faker.commerce.price(),
            deliveryProvider: 'OWN_DRIVER',
            deliveryWindow: [1, 2],
            paymentToken: paymentMethod.paymentMethodToken,
            serviceOrderId: serviceOrder.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            timingsId: timings.id,
        };
    });

    it('should pass the validation when body payload is valid', async () => {
        const body = { ...sampleBody };
        await checkForSuccessValidation({
            body,
        });
    });

    it('should throw an error when there is no body payload', async () => {
        const body = undefined;
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        await createOwnNetworkReturnDeliveryValidation(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should pass the validation when address is undefined', async () => {
        const body = { ...sampleBody };
        body.address = undefined;

        await checkForSuccessValidation({
            body,
        });
    });

    it('should have status 422 when address.city is undefined', async () => {
        const body = { ...sampleBody };
        body.address.city = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when centsCustomerId is undefined', async () => {
        const body = { ...sampleBody };
        body.centsCustomerId = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when deliveryCost is undefined', async () => {
        const body = { ...sampleBody };
        body.deliveryCost = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when deliveryProvider is undefined', async () => {
        const body = { ...sampleBody };
        body.deliveryProvider = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when deliveryWindow is undefined', async () => {
        const body = { ...sampleBody };
        body.deliveryWindow = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when deliveryWindow is invalid', async () => {
        const body = { ...sampleBody };
        body.deliveryWindow = [0];

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should pass the validation when paymentToken is invalid', async () => {
        const body = { ...sampleBody };
        body.paymentToken = 'test';

        await checkForSuccessValidation({
            body,
        });
    });

    it('should have status 422 when paymentToken is undefined', async () => {
        const body = { ...sampleBody };
        body.paymentToken = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when serviceOrderId is undefined', async () => {
        const body = { ...sampleBody };
        body.serviceOrderId = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when storeCustomerId is undefined', async () => {
        const body = { ...sampleBody };
        body.storeCustomerId = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when storeId is undefined', async () => {
        const body = { ...sampleBody };
        body.storeId = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should have status 422 when timingsId is undefined', async () => {
        const body = { ...sampleBody };
        body.timingsId = undefined;

        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });
});
