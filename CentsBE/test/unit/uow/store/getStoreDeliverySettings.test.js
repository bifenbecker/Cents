require('../../../testHelper');
const sinon = require('sinon');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const getStoreDeliverySettings = require('../../../../uow/store/getStoreDeliverySettings');
const GeneralDeliverySettingsService = require('../../../../services/deliverySettings/generalDeliverySettings');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

describe('test getStoreDeliverySettings UoW', () => {
    it('should return valid payload', async () => {
        const initialData = 'initialData';
        const store = await factory.create(FN.store);
        const ownDeliverySettings = await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
        });
        const payload = { storeId: store.id, initialData };

        // call Uow
        const newPayload = await getStoreDeliverySettings(payload);

        // assert
        expect(newPayload, 'should have initial data').have.property('initialData', initialData);
        expect(newPayload, 'should have correct keys')
            .have.property('storeDeliverySettings')
            .have.keys([
                'id',
                'active',
                'storeId',
                'zipCodes',
                'hasZones',
                'deliveryFeeInCents',
                'returnDeliveryFeeInCents',
                'deliveryWindowBufferInHours',
            ]);
        expect(
            newPayload.storeDeliverySettings.id,
            'should have correct storeDeliverySettings',
        ).equals(ownDeliverySettings.id);
    });

    it('should throw Error', async () => {
        const errorMessage = 'Unprovided error!';
        sinon
            .stub(GeneralDeliverySettingsService.prototype, 'ownDeliverySettings')
            .throws(new Error(errorMessage));

        await expect(getStoreDeliverySettings({ storeId: MAX_DB_INTEGER })).to.be.rejectedWith(
            errorMessage,
        );
    });
});
