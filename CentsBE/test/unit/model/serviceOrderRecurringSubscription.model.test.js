require('../../testHelper')
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne, hasOne } = require('../../support/objectionTestHelper')
const ServiceOrderRecurringSubscription = require('../../../models/serviceOrderRecurringSubscription');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');

describe('test ServiceOrderRecurringSubscription model', () => {

    it('should return true if ServiceOrderRecurringSubscription table exists', async () => {
        const hasTableName = await hasTable(ServiceOrderRecurringSubscription.tableName);
        expect(hasTableName).to.be.true;
    })

    it('ServiceOrderRecurringSubscription should have serviceOrder association', async () => {
        hasAssociation(ServiceOrderRecurringSubscription, 'serviceOrder');
    });

    it('ServiceOrderRecurringSubscription should HasOneRelation serviceOrder association', async () => {
        hasOne(ServiceOrderRecurringSubscription, 'serviceOrder');
    });

    it('ServiceOrderRecurringSubscription should have recurringSubscription association', async () => {
        hasAssociation(ServiceOrderRecurringSubscription, 'recurringSubscription');
    });

    it('ServiceOrderRecurringSubscription should BelongsToOneRelation recurringSubscription association', async () => {
        belongsToOne(ServiceOrderRecurringSubscription, 'recurringSubscription');
    });

    it('ServiceOrderRecurringSubscription should update updatedAt field when it updated', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FACTORIES_NAMES.serviceOrderRecurringSubscription,
            model: ServiceOrderRecurringSubscription,
            patchPropName: 'recurringDiscountInPercent',
            patchPropValue: 15
        })
    });

});
