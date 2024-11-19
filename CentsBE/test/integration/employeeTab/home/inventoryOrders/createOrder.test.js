require('../../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../../support/httpRequestsHelper');
const { chai, expect } = require('../../../../support/chaiHelper');
const eventEmitter = require('../../../../../config/eventEmitter');
const { generateToken, classicVersion } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const {
    createServicePayload,
    createInventoryPayload,
} = require('../../../../support/serviceOrderTestHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper');
const moment = require('moment');

const getApiEndpoint = () => {
    return `/api/v1/employee-tab/home/orders/inventory`;
};

describe('createOrder route test', () => {
    let body, emitSpy, store, storeCustomer, token;
    beforeEach(async () => {
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        const laundromatBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: laundromatBusiness.id,
        });
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        token = await generateToken({
            id: store.id,
        });
        emitSpy = chai.spy.on(eventEmitter, 'emit');
        body = {
            customer: {
                id: centsCustomer.id,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                    lineItemType: 'type',
                },
                {
                    priceId: 2,
                    count: 5,
                    lineItemType: 'type2',
                },
            ],
        };
    });

    afterEach(() => {
        chai.spy.restore(eventEmitter);
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => getApiEndpoint(),
        () => ({
            params: {},
            body: { ...body },
        }),
    );

    it('should respond successfully', async () => {
        const res = await assertPostResponseSuccess({
            url: getApiEndpoint(),
            body,
            token,
        });
        expect(res.body).to.have.property('order');
        expect(emitSpy).to.have.been.called.with('indexCustomer', storeCustomer.id);
    });

    describe('duplicate create order request', () => {
        let inventoryPayload;
        beforeEach(async () => {
            inventoryPayload = await createInventoryPayload(store);
        });

        it('include message in duplicate create order request', async () => {
            const initialRes = await ChaiHttpRequestHepler.post(getApiEndpoint(), {}, body)
                .set('authtoken', token)
                .set('version', classicVersion);
            initialRes.should.have.status(200);
            initialRes.body.should.not.have.property(
                'message',
                'Duplicate order recently placed for customer',
            );

            const duplicateRes = await ChaiHttpRequestHepler.post(getApiEndpoint(), {}, body)
                .set('authtoken', token)
                .set('version', classicVersion);
            duplicateRes.should.have.status(200);
            duplicateRes.body.should.have.property('success', true);
            duplicateRes.body.should.have.property(
                'message',
                'Duplicate order recently placed for customer',
            );

            const ms = moment(duplicateRes.placedAt).diff(moment(initialRes.placedAt));
            expect(ms).to.be.lessThanOrEqual(10000);
        });
    });
});
