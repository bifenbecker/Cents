require('../../../testHelper');
const sinon = require('sinon');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { getCreateOrderReq } = require('../../../support/requestCreators/getCreateOrderReq');
const createOrderValidation = require('../../../../validations/liveLink/createOrder');
const elasticClient = require('../../../../elasticsearch');
const BusinessPromotionProgram = require('../../../../models/businessPromotionProgram');
const { returnMethods } = require('../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

describe('test createOrder liveLink validation', () => {
    let req;
    let entities;

    beforeEach(async () => {
        const {
            req: helperReq,
            entities: helperEntities,
            entities: { centsCustomer },
        } = await getCreateOrderReq();
        req = helperReq;
        req.currentCustomer = centsCustomer;
        entities = helperEntities;
    });

    describe('should call next()', async () => {
        const defaultAssert = (
            mockedReq,
            mockedNext,
            store,
            storeSettings,
            centsCustomerAddress,
        ) => {
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
            expect(mockedReq, 'req should have constants').have.property('constants');
            expect(mockedReq.constants, 'req.constants should have correct orderItems')
                .have.property('orderItems')
                .to.be.an('array').that.is.empty;
            expect(mockedReq.constants, 'req.constants should have correct customerAddress')
                .have.property('customerAddress')
                .deep.equal(centsCustomerAddress);
            expect(mockedReq.constants.store, 'req.constants should have correct store')
                .have.property('id')
                .equal(store.id);
            expect(
                mockedReq.constants.store,
                'req.constants.store should have correct storeSettings',
            )
                .have.property('settings')
                .deep.equal(storeSettings);
            expect(mockedReq.constants, 'req.constants should have correct storeDetails')
                .have.property('storeDetails')
                .deep.equal({ ...store, settings: storeSettings });
            expect(mockedReq.constants, 'req.constants should have correct from')
                .have.property('from')
                .equal('CREATE_ONLINE_ORDER');
        };

        describe('with DELIVERY return method', async () => {
            it('with promoCode', async () => {
                const { businessPromotionPrograms, centsCustomerAddress, store, storeSettings } =
                    entities;
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                // call validator
                await createOrderValidation(mockedReq, mockedRes, mockedNext);

                // assert
                defaultAssert(mockedReq, mockedNext, store, storeSettings, centsCustomerAddress);
                expect(mockedReq.constants, 'req.constants should have correct promotion')
                    .have.property('promotion')
                    .deep.equal({ ...businessPromotionPrograms, promotionItems: [] });
            });

            it('without promoCode', async () => {
                const { centsCustomerAddress, store, storeSettings } = entities;
                req.body.promoCode = null;
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                // call validator
                await createOrderValidation(mockedReq, mockedRes, mockedNext);

                // assert
                defaultAssert(mockedReq, mockedNext, store, storeSettings, centsCustomerAddress);
                expect(
                    mockedReq.constants,
                    'req.constants should not have promotion property',
                ).not.have.property('promotion');
            });
        });

        it('with IN_STORE_PICKUP return method', async () => {
            const { centsCustomerAddress, store, storeSettings } = entities;
            req.body.returnMethod = returnMethods.IN_STORE_PICKUP;
            req.body.orderDelivery.delivery = {};

            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            defaultAssert(mockedReq, mockedNext, store, storeSettings, centsCustomerAddress);
        });
    });

    describe('should response correct error', async () => {
        it('by Joi validation', async () => {
            req.body.orderDelivery.delivery.deliveryWindow = [];
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(422), 'with 422 status code').to.be.true;
            expect(
                mockedRes.json.getCall(0).args[0],
                'with correct error in response',
            ).have.property(
                'error',
                'Delivery windows are required. Each window should be greater than or equal to 0.',
            );
        });

        it('when Store not found in Elastic', async () => {
            req.params.storeId = MAX_DB_INTEGER;
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
            sinon.stub(elasticClient, 'get').returns({ body: { _source: null } });

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(404), 'with 404 status code').to.be.true;
            expect(
                mockedRes.json.getCall(0).args[0],
                'with correct error in response',
            ).have.property('error', 'Store not found.');
        });

        it('when Store not found in Elastic with Response Error', async () => {
            req.params.storeId = MAX_DB_INTEGER;
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(404), 'with 404 status code').to.be.true;
            expect(
                mockedRes.json.getCall(0).args[0],
                'with correct error in response',
            ).have.property('error', 'Store not found.');
        });

        it('when customer address not found', async () => {
            req.body.customerAddressId = MAX_DB_INTEGER;
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(404), 'with 404 status code').to.be.true;
            expect(
                mockedRes.json.getCall(0).args[0],
                'with correct error in response',
            ).have.property('error', 'Customer address not found.');
        });

        it('when promotion code is invalid', async () => {
            req.body.promoCode = 'Unreal promo';
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(404), 'with 404 status code').to.be.true;
            expect(
                mockedRes.json.getCall(0).args[0],
                'with correct error in response',
            ).have.property('error', 'The promotion code is invalid or does not exist.');
        });

        it('when promotion code is no longer active', async () => {
            await BusinessPromotionProgram.query()
                .patch({
                    active: false,
                })
                .findById(entities.businessPromotionPrograms.id);
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(404), 'with 404 status code').to.be.true;
            expect(
                mockedRes.json.getCall(0).args[0],
                'with correct error in response',
            ).have.property('error', 'This promotion is no longer active.');
        });

        it('when promotion code is no longer applicable', async () => {
            await BusinessPromotionProgram.query()
                .patch({
                    customerRedemptionLimit: 1,
                })
                .findById(entities.businessPromotionPrograms.id);
            await factory.create(FN.serviceOrder, {
                promotionId: entities.businessPromotionPrograms.id,
                storeCustomerId: entities.storeCustomer.id,
            });
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await createOrderValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(404), 'with 404 status code').to.be.true;
            expect(
                mockedRes.json.getCall(0).args[0],
                'with correct error in response',
            ).have.property('error', 'This promotion is no longer applicable.');
        });
    });

    it('should call next(error) with unprovided error', async () => {
        const errorMessage = 'Unprovided error!';
        sinon.stub(elasticClient, 'get').throws(new Error(errorMessage));
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        // call validator
        await createOrderValidation(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
    });
});
