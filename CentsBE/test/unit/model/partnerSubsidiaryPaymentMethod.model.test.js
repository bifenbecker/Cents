require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');
const PartnerSubsidiaryPaymentMethod = require('../../../models/partnerSubsidiaryPaymentMethod');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test PartnerSubsidiaryPaymentMethod model', () => {
    it('should return true if partnerSubsidiaryPaymentMethods table exists', async () => {
        const hasTableName = await hasTable(PartnerSubsidiaryPaymentMethod.tableName);
        expect(hasTableName).to.be.true;
    });

    it('PartnerSubsidiaryPaymentMethod should have partnerSubsidiary association', () => {
        hasAssociation(PartnerSubsidiaryPaymentMethod, 'partnerSubsidiary');
    });

    it('PartnerSubsidiaryPaymentMethod should BelongsToOneRelation partnerSubsidiary association', async () => {
        belongsToOne(PartnerSubsidiaryPaymentMethod, 'partnerSubsidiary');
    });

    it('PartnerSubsidiaryPaymentMethod should update updatedAt field when entity updated', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FN.partnerSubsidiaryPaymentMethod,
            model: PartnerSubsidiaryPaymentMethod,
            patchPropName: 'paymentMethodToken',
            patchPropValue: 'pm_card',
        });
    });
});
