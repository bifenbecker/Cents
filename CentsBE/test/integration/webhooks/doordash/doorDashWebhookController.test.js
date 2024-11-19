const sinon = require('sinon');
require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect, chai } = require('../../../support/chaiHelper');
const {
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { StoreSchema } = require('../../../../elasticsearch/store/schema');
const { reindexStoresData } = require('../../../../elasticsearch/store/reindexData');
const eventEmitter = require('../../../../config/eventEmitter');

const DOORDASH_WEBHOOK_ENDPOINT = '/api/v1/webhooks/doordash/status/update';

describe('test doordash webhook controller APIs', () => {
    before(async () => {
        await StoreSchema();
    });
    let serviceOrder, delivery, payload, spy;
    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder, {});
        const order = await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id
        });
        delivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            deliveryProvider: 'DOORDASH',
            thirdPartyDeliveryId: 123456,
        });
        payload = {
            delivery: { id: 123456, event_category: 'dasher_confirmed' },
        }
        await reindexStoresData();
        spy = chai.spy(() => { });
        eventEmitter.once('indexCustomer', spy);
    })
    it('should emit index customer event ', async () => {
        const result = await assertPostResponseSuccess({
            url: DOORDASH_WEBHOOK_ENDPOINT,
            body: payload,
            token: '',
        });
        expect(spy).to.have.been.called.with(serviceOrder.storeCustomerId);
    })
});
