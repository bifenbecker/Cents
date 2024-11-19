require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasOne, hasAssociation } = require('../../support/objectionTestHelper');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const ScaleDeviceStoreMap = require('../../../models/scaleDeviceStoreMap');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');

describe('test ScaleDeviceStoreMap model', () => {
    it('should return true if scaleDeviceStoreMap table exists', async () => {
        const hasTableName = await hasTable(ScaleDeviceStoreMap.tableName);
        expect(hasTableName).to.be.true;
    });

    it('should return true if scaleDeviceStoreMap idColumn exists', async () => {
        const idColumn = ScaleDeviceStoreMap.idColumn;
        expect(idColumn).not.to.be.empty;
    });

    it('scaleDeviceStoreMap should have stores association', () => {
        hasAssociation(ScaleDeviceStoreMap, 'store');
    });

    it('scaleDeviceStoreMap should have one stores association', async () => {
        hasOne(ScaleDeviceStoreMap, 'store');
    });

    it('scaleDeviceStoreMap should have scaleDevice association', () => {
        hasAssociation(ScaleDeviceStoreMap, 'scaleDevice');
    });

    it('scaleDeviceStoreMap should have one scaleDevice association', async () => {
        hasOne(ScaleDeviceStoreMap, 'scaleDevice');
    });

    it('scaleDeviceStoreMap should update updatedAt field when it updated', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FACTORIES_NAMES.scaleDeviceStoreMap,
            model: ScaleDeviceStoreMap,
            patchPropName: 'createdAt',
            patchPropValue: new Date('4-5-2022').toISOString(),
        });
    });
});
