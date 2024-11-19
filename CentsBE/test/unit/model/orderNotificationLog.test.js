require('../../testHelper')
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper')
const OrderNotificationLog = require('../../../models/orderNotificationLog');

describe('test OrderNotificationLog model', () => {

    it('should return true if OrderNotificationLog table exists', async () => {
        const hasTableName = await hasTable(OrderNotificationLog.tableName)
        expect(hasTableName).to.be.true
    })

    it('OrderNotificationLog should have order association', async () => {
        hasAssociation(OrderNotificationLog, 'order')
    });

    it('OrderNotificationLog should BelongsToOneRelation order association', async () => {
        belongsToOne(OrderNotificationLog, 'order')
    });

    it('OrderNotificationLog should have language association', async () => {
        hasAssociation(OrderNotificationLog, 'language')
    });

    it('OrderNotificationLog should BelongsToOneRelation language association', async () => {
        belongsToOne(OrderNotificationLog, 'language')
    });
});
