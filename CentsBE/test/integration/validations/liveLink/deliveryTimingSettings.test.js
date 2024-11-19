require('../../../testHelper');
const momenttz = require('moment-timezone');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { getCreateOrderReq } = require('../../../support/requestCreators/getCreateOrderReq');
const deliveryTimingSettingsValidation = require('../../../../validations/liveLink/deliveryTimingSettings');
const {
    deliveryProviders,
    ORDER_TYPES,
    orderDeliveryStatuses,
} = require('../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test deliveryTimingSettings liveLink validation', () => {
    it('if pickup and delivery is not there', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body: {},
        });

        // call validator
        await deliveryTimingSettingsValidation(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
            'array',
        ).that.is.empty;
    });

    it('if delivery and pickup not by own delivery', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body: {
                orderDelivery: {
                    pickup: {
                        deliveryProvider: deliveryProviders.DOORDASH,
                    },
                    return: {
                        deliveryProvider: deliveryProviders.DOORDASH,
                    },
                },
            },
        });

        // call validator
        await deliveryTimingSettingsValidation(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
            'array',
        ).that.is.empty;
    });

    describe('if delivery and pickup by own driver', async () => {
        describe('with timingId and deliveryWindow', async () => {
            let req;
            let entities;
            const startWindow = momenttz().add(2, 'd');
            const endWindow = momenttz().add(2, 'd').add(2, 'h');

            beforeEach(async () => {
                const helperResult = await getCreateOrderReq();
                req = helperResult.req;
                entities = helperResult.entities;
                req.body = {
                    orderDelivery: {
                        pickup: {
                            deliveryProvider: deliveryProviders.OWN_DRIVER,
                            timingsId: entities.timing.id,
                            deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                        },
                        return: {
                            deliveryProvider: deliveryProviders.OWN_DRIVER,
                            timingsId: entities.timing.id,
                            deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                        },
                    },
                };
                req.constants = {
                    order: {
                        masterOrderId: entities.order.id,
                        orderType: ORDER_TYPES.ONLINE,
                        storeId: entities.store.id,
                    },
                };
            });

            it('such CREATE_ONLINE_ORDER (not manage)', async () => {
                req.constants = { from: 'CREATE_ONLINE_ORDER' };
                req.body.orderDelivery.return.deliveryWindow = [];

                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                // call validator
                await deliveryTimingSettingsValidation(mockedReq, mockedRes, mockedNext);

                // assert
                expect(mockedNext.called, 'should call next()').to.be.true;
                expect(
                    mockedNext.getCall(0).args,
                    'should call next() without error in args',
                ).to.be.an('array').that.is.empty;
            });

            describe('such not CREATE_ONLINE_ORDER (as manage)', async () => {
                it('with RESIDENTIAL order type', async () => {
                    req.constants.order.orderType = ORDER_TYPES.RESIDENTIAL;
                    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                    // call validator
                    await deliveryTimingSettingsValidation(mockedReq, mockedRes, mockedNext);

                    // assert
                    expect(mockedNext.called, 'should call next()').to.be.true;
                    expect(
                        mockedNext.getCall(0).args,
                        'should call next() without error in args',
                    ).to.be.an('array').that.is.empty;
                });

                it('with SERVICE order type', async () => {
                    req.constants.order.orderType = ORDER_TYPES.SERVICE;
                    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                    // call validator
                    await deliveryTimingSettingsValidation(mockedReq, mockedRes, mockedNext);

                    // assert
                    expect(mockedNext.called, 'should call next()').to.be.true;
                    expect(
                        mockedNext.getCall(0).args,
                        'should call next() without error in args',
                    ).to.be.an('array').that.is.empty;
                });

                describe('with ONLINE order type', async () => {
                    describe('without pickup and return changes', async () => {
                        it('should call next() without error in args', async () => {
                            const { mockedReq, mockedRes, mockedNext } =
                                createMiddlewareMockedArgs(req);

                            // call validator
                            await deliveryTimingSettingsValidation(
                                mockedReq,
                                mockedRes,
                                mockedNext,
                            );

                            // assert
                            expect(mockedNext.called, 'should call next()').to.be.true;
                            expect(
                                mockedNext.getCall(0).args,
                                'should call next() without error in args',
                            ).to.be.an('array').that.is.empty;
                        });
                    });

                    describe('with pickup and return changed', async () => {
                        it('should call next() without error in args', async () => {
                            const { mockedReq, mockedRes, mockedNext } =
                                createMiddlewareMockedArgs(req);

                            // call validator
                            await deliveryTimingSettingsValidation(
                                mockedReq,
                                mockedRes,
                                mockedNext,
                            );

                            // assert
                            expect(mockedNext.called, 'should call next()').to.be.true;
                            expect(
                                mockedNext.getCall(0).args,
                                'should call next() without error in args',
                            ).to.be.an('array').that.is.empty;
                        });
                        describe('should response error', async () => {
                            beforeEach(async () => {
                                const newTiming = await factory.create(FN.timing, {
                                    startTime: startWindow.format(),
                                    endTime: endWindow.format(),
                                });
                                await factory.create(FN.deliveryTimingSetting, {
                                    timingsId: newTiming.id,
                                    maxStops: 1,
                                });
                                entities.newTiming = newTiming;

                                const additionalOrder = await factory.create(
                                    FN.serviceOrderMasterOrder,
                                );
                                entities.additionalOrder = additionalOrder;
                            });

                            it('when has not pickup slots', async () => {
                                const {
                                    store,
                                    storeCustomer,
                                    centsCustomerAddress,
                                    newTiming,
                                    additionalOrder,
                                    timing,
                                    order,
                                } = entities;
                                await factory.create(FN.orderDelivery, {
                                    orderId: order.id,
                                    storeId: store.id,
                                    storeCustomerId: storeCustomer.id,
                                    timingsId: timing.id,
                                    centsCustomerAddressId: centsCustomerAddress.id,
                                    deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                                    type: 'PICKUP',
                                    status: orderDeliveryStatuses.SCHEDULED,
                                });
                                await factory.create(FN.orderDelivery, {
                                    orderId: additionalOrder.id,
                                    storeId: store.id,
                                    storeCustomerId: storeCustomer.id,
                                    timingsId: newTiming.id,
                                    centsCustomerAddressId: centsCustomerAddress.id,
                                    deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                                    type: 'PICKUP',
                                });
                                req.body.orderDelivery.pickup.timingsId = newTiming.id;

                                const { mockedReq, mockedRes, mockedNext } =
                                    createMiddlewareMockedArgs(req);

                                // call validator
                                await deliveryTimingSettingsValidation(
                                    mockedReq,
                                    mockedRes,
                                    mockedNext,
                                );

                                // assert
                                expect(mockedNext.called, 'should not call next()').to.be.false;
                                expect(mockedRes.status.calledWith(400), 'with 400 status code').to
                                    .be.true;
                                expect(
                                    mockedRes.json.getCall(0).args[0],
                                    'with correct error in response',
                                ).have.property(
                                    'error',
                                    'No stops are available for this pickup window.',
                                );
                            });

                            it('when has not return slots', async () => {
                                const {
                                    store,
                                    storeCustomer,
                                    centsCustomerAddress,
                                    newTiming,
                                    additionalOrder,
                                    order,
                                    timing,
                                } = entities;
                                await factory.create(FN.orderDelivery, {
                                    orderId: order.id,
                                    storeId: store.id,
                                    storeCustomerId: storeCustomer.id,
                                    timingsId: timing.id,
                                    centsCustomerAddressId: centsCustomerAddress.id,
                                    deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                                    status: orderDeliveryStatuses.SCHEDULED,
                                });
                                await factory.create(FN.orderDelivery, {
                                    orderId: additionalOrder.id,
                                    storeId: store.id,
                                    storeCustomerId: storeCustomer.id,
                                    timingsId: newTiming.id,
                                    centsCustomerAddressId: centsCustomerAddress.id,
                                    deliveryWindow: [startWindow.valueOf(), endWindow.valueOf()],
                                    type: 'RETURN',
                                    status: orderDeliveryStatuses.SCHEDULED,
                                });
                                req.body.orderDelivery.return.timingsId = newTiming.id;

                                const { mockedReq, mockedRes, mockedNext } =
                                    createMiddlewareMockedArgs(req);

                                // call validator
                                await deliveryTimingSettingsValidation(
                                    mockedReq,
                                    mockedRes,
                                    mockedNext,
                                );

                                // assert
                                expect(mockedNext.called, 'should not call next()').to.be.false;
                                expect(mockedRes.status.calledWith(400), 'with 400 status code').to
                                    .be.true;
                                expect(
                                    mockedRes.json.getCall(0).args[0],
                                    'with correct error in response',
                                ).have.property(
                                    'error',
                                    'No stops are available for this return window.',
                                );
                            });
                        });
                    });
                });
            });
        });
    });

    it('should call next(error) for unprovided errors', async () => {
        const errorMessage = "Cannot read property 'orderDelivery' of undefined";
        const req = {};
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        // call validator
        await deliveryTimingSettingsValidation(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
    });
});
