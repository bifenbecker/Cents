require('../../../testHelper');
const { expect} = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getActiveDeliverySettingsUow = require('../../../../uow/delivery/getActiveDeliverySettingsUow');

describe('test getActiveDeliverySettingsUow', () => {
    let ownDriverSetting, onDemandSettings, activeSettings;
    it('should return both as true', async () => {
        ownDriverSetting = await factory.create('ownDeliverySetting');
        onDemandSettings = await factory.create('centsDeliverySettings', {storeId: ownDriverSetting.storeId});
        activeSettings = await getActiveDeliverySettingsUow({storeId: ownDriverSetting.storeId});
        expect(activeSettings).to.have.a.property('isOwndriverSettingsActive').to.equal(true);
        expect(activeSettings).to.have.a.property('isOnDemandSettingsActive').to.equal(true);
    });
    it('should return both as false', async () => {
        ownDriverSetting = await factory.create('ownDeliverySetting', {active: false});
        onDemandSettings = await factory.create('centsDeliverySettings', {storeId: ownDriverSetting.storeId, active: false});
        activeSettings = await getActiveDeliverySettingsUow({storeId: ownDriverSetting.storeId});
        expect(activeSettings).to.have.a.property('isOwndriverSettingsActive').to.equal(false);
        expect(activeSettings).to.have.a.property('isOnDemandSettingsActive').to.equal(false);
    });
});

