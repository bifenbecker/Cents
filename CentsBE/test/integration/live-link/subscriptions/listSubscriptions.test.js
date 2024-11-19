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

const apiEndpoint = '/api/v1/live-status/subscriptions';
describe(`test ${apiEndpoint} API endpoint`, () => {
    let centsCustomer;
    let customerauthtoken;

    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);

        const jwtService = new JwtService(JSON.stringify(centsCustomer));
        customerauthtoken = jwtService.tokenGenerator(process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
    });

    describe('should return correct response', async () => {
        it('with subscriptions and windows', async () => {
            const subscription = await factory.create(FN.recurringSubscription, {
                centsCustomerId: centsCustomer.id,
            });
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

            // call
            const response = await ChaiHttpRequestHelper.get(apiEndpoint).set({
                customerauthtoken,
            });

            // assert
            expect(response.statusCode).equals(200);
            expect(response.body).should.not.be.empty;
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body).to.have.property('subscriptions').to.be.an('array').lengthOf(1);
            const responseSubscription = response.body.subscriptions[0];
            expect(responseSubscription).have.property('recurringSubscriptionId', subscription.id);
            expect(responseSubscription).have.property('centsCustomerId', centsCustomer.id);
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
            expect(responseSubscription).have.property('modifierIds').to.be.an('array').lengthOf(1);
            expect(responseSubscription)
                .have.property('cancelledPickupWindows')
                .to.be.an('array')
                .lengthOf(0);
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
        });

        it('without subscriptions and windows', async () => {
            // call
            const response = await ChaiHttpRequestHelper.get(apiEndpoint).set({
                customerauthtoken,
            });

            // assert
            expect(response.statusCode).equals(200);
            expect(response.body).should.not.be.empty;
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body).to.have.property('subscriptions').to.be.an('array').lengthOf(0);
        });
    });

    it('should throw Error', async () => {
        sinon.stub(Pipeline.prototype, 'run').throws();

        // call
        const response = await ChaiHttpRequestHelper.get(apiEndpoint).set({
            customerauthtoken,
        });

        // assert
        expect(response.statusCode).equals(500);
        expect(response.body).to.have.property('error', 'Error');
    });
});
