require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

describe('test orderNotificationLogs', () => {
    let store, token, language, serviceOrder, orderNotificationLog;
    const apiEndPoint = '/api/v1/employee-tab/home/order/notification-logs';

    beforeEach(async () => {
        store = await factory.create('store');
        token = generateToken({
            id: store.id,
        });
        language = await factory.create('language');
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        orderNotificationLog = await factory.create('orderNotificationLog', {
            orderId: serviceOrder.id,
            languageId: language.id,
        }); 
    });

    it('should fail when token is not provided', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {})
        .set('authtoken', '');
        res.should.have.status(401);
        expect(res.body).to.have.property('error').to.equal('Please sign in to proceed.');
    });

    it('should return orderNotificationLogs', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            orderId: serviceOrder.id,
        }).set(
            'authtoken',
            token,
        );

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('notificationLogs').to.not.be.empty;
        expect(res.body.notificationLogs[0]).to.have.property('id').to.equal(orderNotificationLog.id);
        expect(res.body.notificationLogs[0]).to.have.property('orderId').to.equal(serviceOrder.id);
        expect(res.body.notificationLogs[0]).to.have.property('language').to.have.property('id').to.equal(language.id);
    });
});
