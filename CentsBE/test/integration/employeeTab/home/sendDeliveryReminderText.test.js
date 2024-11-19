require('../../../testHelper');
const momenttz = require('moment-timezone');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    assertPostResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

function getApiEndPoint(serviceOrderId) {
    return `/api/v1/employee-tab/home/serviceOrder/${serviceOrderId}/delivery-reminder`;
}

describe('test sendDeliveryReminderText api', () => {
    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => getApiEndPoint(1),
    );

    it('should send delivery reminder text successfully', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const timing = await factory.create(FN.timing);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'READY_FOR_DRIVER_PICKUP',
        });
        const orderNotificationLog = await factory.create(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            timingsId: timing.id,
        });
        const storeSettings = store.getStoreSettings();
        await storeSettings.update({
            timeZone: 'America/New_York',
        }).execute();
        const time = momenttz(Number(orderDelivery.deliveryWindow[0])).tz('America/New_York');
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(serviceOrder.id)).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body.success).to.eq(true);
        expect(res.body.deliveryReminderText).to.eq(`Sending at 7:00 PM on ${time.subtract(1, 'day').format('MMMM Do')}`);
    });

    it('should throw an error if serviceOrder factory was not created', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(-1)).set('authtoken', token);
        res.should.have.status(500);
    });
});