require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
    hasOne
} = require('../../support/objectionTestHelper');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');
const RecurringSubscription = require('../../../models/recurringSubscription');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test recurringSubscription model', () => {
    it('should return true if recurringSubscription table exists', async () => {
        const hasTableName = await hasTable(RecurringSubscription.tableName);
        expect(hasTableName).to.be.true;
    });

    it('RecurringSubscription should have store association', async () => {
        hasAssociation(RecurringSubscription, 'store');
    });

    it('RecurringSubscription should BelongsToOneRelation store association', async () => {
        belongsToOne(RecurringSubscription, 'store');
    });

    it('RecurringSubscription should have customer association', async () => {
        hasAssociation(RecurringSubscription, 'customer');
    });

    it('RecurringSubscription should BelongsToOneRelation customer association', async () => {
        belongsToOne(RecurringSubscription, 'customer');
    });

    it('RecurringSubscription should have address association', async () => {
        hasAssociation(RecurringSubscription, 'address');
    });

    it('RecurringSubscription should BelongsToOneRelation address association', async () => {
        hasOne(RecurringSubscription, 'address');
    });

    it('RecurringSubscription should have pickup association', async () => {
        hasAssociation(RecurringSubscription, 'pickup');
    });

    it('RecurringSubscription should BelongsToOneRelation pickup association', async () => {
        hasOne(RecurringSubscription, 'pickup');
    });

    it('RecurringSubscription should have return association', async () => {
        hasAssociation(RecurringSubscription, 'return');
    });

    it('RecurringSubscription should BelongsToOneRelation return association', async () => {
        hasOne(RecurringSubscription, 'return');
    });

    it('RecurringSubscription should have servicePrice association', async () => {
        hasAssociation(RecurringSubscription, 'servicePrice');
    });

    it('RecurringSubscription should BelongsToOneRelation servicePrice association', async () => {
        hasOne(RecurringSubscription, 'servicePrice');
    });

    it('RecurringSubscription should have updatedAt field when updated for beforeUpdate hook', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FN.recurringSubscription,
            factoryData: { cancelledPickupWindows: [] },
            model: RecurringSubscription,
            patchPropName: 'cancelledPickupWindows',
            patchPropValue: [],
        });
    });
});
