require('../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const factory = require('../../../factories');
const JwtService = require('../../../../services/tokenOperations/main');
const Pipeline = require('../../../../pipeline/pipeline');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    ORDER_TYPES,
    statuses,
    ORDER_DELIVERY_TYPES,
    ORDERABLE_TYPES,
} = require('../../../../constants/constants');
const StoreSettings = require('../../../../models/storeSettings');
const RecurringSubscription = require('../../../../models/recurringSubscription');

const apiEndpoint = '/api/v1/live-status/subscriptions/:id';
describe(`test ${apiEndpoint} API endpoint`, () => {
    let store;
    let centsCustomer;
    let customerauthtoken;
    let subscription;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomer = await factory.create(FN.centsCustomer);
        await StoreSettings.query()
            .patch({
                timeZone: 'America/Los_Angeles',
            })
            .findById(store.id);

        const jwtService = new JwtService(JSON.stringify(centsCustomer));
        customerauthtoken = jwtService.tokenGenerator(process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
        subscription = await factory.create(FN.recurringSubscription, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });
    });

    describe('should return correct response', async () => {
        const defaultAssert = (response, subscription) => {
            expect(response.statusCode).equals(200);
            expect(response.body).should.not.be.empty;
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body).to.have.property('subscription').to.be.an('object').to.be.not
                .empty;
            const responseSubscription = response.body.subscription;
            expect(responseSubscription).to.have.property(
                'recurringSubscriptionId',
                subscription.id,
            );
            expect(responseSubscription).to.have.property('centsCustomerId', centsCustomer.id);
            expect(responseSubscription)
                .have.property('centsCustomerAddress')
                .have.keys([
                    'id',
                    'centsCustomerId',
                    'address1',
                    'address2',
                    'city',
                    'firstLevelSubdivisionCode',
                    'postalCode',
                    'countryCode',
                    'createdAt',
                    'updatedAt',
                    'googlePlacesId',
                    'instructions',
                    'leaveAtDoor',
                    'lat',
                    'lng',
                ]);
            expect(responseSubscription)
                .to.have.property('modifierIds')
                .to.be.an('array')
                .lengthOf(1);
            expect(responseSubscription).include.keys([
                'frequency',
                'servicePriceId',
                'paymentToken',
                'frequency',
                'pickup',
                'delivery',
                'nextPickupDatetime',
                'nextAvailablePickup',
                'isNextPickupCancelled',
                'recurringDiscountInPercent',
                'interval',
                'canCancelPickup',
            ]);
        };

        beforeEach(async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                orderType: ORDER_TYPES.ONLINE,
                status: statuses.COMPLETED,
            });
            const order = await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
            });
            await factory.create(FN.orderDelivery, {
                orderId: order.id,
                type: ORDER_DELIVERY_TYPES.PICKUP,
                status: statuses.COMPLETED,
            });
            await factory.create(FN.serviceOrderRecurringSubscription, {
                recurringSubscriptionId: subscription.id,
                serviceOrderId: serviceOrder.id,
            });
        });

        it('without changes', async () => {
            // call
            const response = await ChaiHttpRequestHelper.patch(
                apiEndpoint.replace(':id', subscription.id),
            ).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response, subscription);
            const currentSubscription = await RecurringSubscription.query().findById(
                subscription.id,
            );
            expect(currentSubscription).to.have.property('deletedAt').to.be.null;
            expect(response.body.subscription)
                .have.property('cancelledPickupWindows')
                .to.be.an('array')
                .lengthOf(0);
            expect(response.body.subscription).to.have.property('interval', 1);
        });

        it('and delete subscription', async () => {
            // call
            const response = await ChaiHttpRequestHelper.patch(
                apiEndpoint.replace(':id', subscription.id),
                {},
                { isDeleted: true },
            ).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response, subscription);
            const currentSubscription = await RecurringSubscription.query().findById(
                subscription.id,
            );
            expect(currentSubscription).to.have.property('deletedAt').to.not.be.null;
            expect(response.body.subscription)
                .have.property('cancelledPickupWindows')
                .to.be.an('array')
                .lengthOf(0);
            expect(response.body.subscription).to.have.property('interval', 1);
        });

        it('and cancelNextPickup', async () => {
            // call
            const response = await ChaiHttpRequestHelper.patch(
                apiEndpoint.replace(':id', subscription.id),
                {},
                { cancelNextPickup: true },
            ).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response, subscription);
            const currentSubscription = await RecurringSubscription.query().findById(
                subscription.id,
            );
            expect(currentSubscription).to.have.property('deletedAt').to.be.null;
            expect(response.body.subscription)
                .have.property('cancelledPickupWindows')
                .to.be.an('array')
                .lengthOf(1);
            expect(response.body.subscription).to.have.property('interval', 1);
        });

        it('and reinstateNextPickup', async () => {
            await RecurringSubscription.query()
                .patch({ cancelledPickupWindows: [3931057400000] })
                .findById(subscription.id);

            // call
            const response = await ChaiHttpRequestHelper.patch(
                apiEndpoint.replace(':id', subscription.id),
                {},
                { reinstateNextPickup: true },
            ).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response, subscription);
            const currentSubscription = await RecurringSubscription.query().findById(
                subscription.id,
            );
            expect(currentSubscription).to.have.property('deletedAt').to.be.null;
            expect(response.body.subscription)
                .have.property('cancelledPickupWindows')
                .to.be.an('array')
                .lengthOf(0);
            expect(response.body.subscription).to.have.property('interval', 1);
        });

        it('and change interval', async () => {
            const interval = 5;

            // call
            const response = await ChaiHttpRequestHelper.patch(
                apiEndpoint.replace(':id', subscription.id),
                {},
                { interval },
            ).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response, subscription);
            const currentSubscription = await RecurringSubscription.query().findById(
                subscription.id,
            );
            expect(currentSubscription).to.have.property('deletedAt').to.be.null;
            expect(response.body.subscription)
                .have.property('cancelledPickupWindows')
                .to.be.an('array')
                .lengthOf(0);
            expect(response.body.subscription).to.have.property('interval', interval);
        });
    });

    it('should throw Error', async () => {
        sinon.stub(Pipeline.prototype, 'run').throws();

        // call
        const response = await ChaiHttpRequestHelper.patch(
            apiEndpoint.replace(':id', subscription.id),
        ).set({
            customerauthtoken,
        });

        // assert
        expect(response.statusCode).equals(500);
        expect(response.body).to.have.property('error', 'Error');
    });
});
