require('../../../testHelper');
const BusinessSettings = require('../../../../models/businessSettings');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const {
    assertPutResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { locationType } = require('../../../../constants/constants');
const { expect, assert } = require('../../../support/chaiHelper');
const stripe = require('../../../../stripe/stripeWithSecret');
const sinon = require('sinon');
const { some } = require('lodash');

function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test create location api', () => {
    let store, token;
    const apiEndPoint = '/api/v1/employee-tab/home/location';

    beforeEach(async () => {
        store = await factory.create('store');
        token = getToken(store.id);
    });

    itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () => apiEndPoint);

    it('should return status 200 and without entries created', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);
        res.should.have.status(200);
        assert.equal(res.body.stripeReaders.length, 0);
        assert.equal(Object.keys(res.body.cciSettings).length, 0);
        assert.equal(res.body.scaleDevices.length, 0);
    });

    it('should return status 200 and with entries created', async () => {
        const stripeLocationId = '12345',
            stripeTerminalId = '54321';

        const laundromatBusiness = await factory.create('laundromatBusiness');
        const taxRate = await factory.create('taxRate', {
            businessId: laundromatBusiness.id,
            rate: 5,
        });
        const district = await factory.create('district');
        const scaleDevice = await factory.create('scaleDevice');

        const storeData = {
            businessId: laundromatBusiness.id,
            taxRateId: taxRate.id,
            districtId: district.id,
            stripeTerminalId: stripeTerminalId,
            stripeLocationId: stripeLocationId,
        };

        store = await factory.create('store', storeData);
        token = getToken(store.id);

        const storeTheme = await factory.create('storeTheme', {
            storeId: store.id,
            businessId: laundromatBusiness.id,
        });

        const spyderWashSettings = await factory.create('spyderWashSettings', {
            storeId: store.id,
        });

        const tipSetting = await factory.create('tipSetting', {
            businessId: laundromatBusiness.id,
        });

        const convenienceFee = await factory.create('convenienceFee', {
            businessId: laundromatBusiness.id,
        });

        const cciSetting = await factory.create('cciSetting', {
            storeId: store.id,
        });

        const scaleDeviceStoreMap = await factory.create('scaleDeviceStoreMap', {
            storeId: store.id,
            scaleDeviceId: scaleDevice.id,
        });

        const stripeReader = {
            location: stripeLocationId,
            device_type: 'bbpos_wisepos_e',
            status: 'online',
        };
        sinon.stub(stripe.terminal, 'readers').value({
            list: () => ({
                data: [stripeReader],
            }),
        });

        const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);

        res.should.have.status(200);
        assert.equal(res.body.store.id, store.id);
        assert.equal(res.body.store.name, store.name);
        assert.equal(res.body.store.type, store.type);
        assert.equal(res.body.store.phoneNumber, store.phoneNumber);
        assert.equal(res.body.store.stripeLocationId, stripeLocationId);
        assert.equal(res.body.store.stripeTerminalId, stripeTerminalId);
        assert.equal(res.body.scaleDevices[0].id, scaleDeviceStoreMap.scaleDeviceId);
        assert.equal(res.body.businessSettings.tipSettings.id, tipSetting.id);
        assert.equal(res.body.businessSettings.tipSettings.businessId, tipSetting.businessId);
        assert.equal(res.body.businessSettings.tipSettings.tipType, tipSetting.tipType);
        expect(res.body.stripeReaders[0]).to.include(stripeReader);
        expect(res.body.business).to.include(laundromatBusiness);
        expect(res.body.businessSettings.convenienceFee).to.include(convenienceFee);
        expect(res.body.cciSettings).to.include(cciSetting);
        expect({ ...res.body.region.district, regionId: res.body.region.id }).to.include(district);
        expect(res.body.spyderWashSettings).to.include(spyderWashSettings);
        expect(res.body.taxRate).to.include(taxRate);
        expect(some(res.body.store.storeTheme, storeTheme)).to.be.true;
    });

    it('should return status 200 and with entries created (alternative)', async () => {
        const stripeLocationId = '12345',
            stripeTerminalId = '54321';

        const laundromatBusiness = await factory.create('laundromatBusiness');
        const taxRate = await factory.create('taxRate', {
            businessId: laundromatBusiness.id,
            rate: 5,
        });

        const storeData = {
            businessId: laundromatBusiness.id,
            taxRateId: taxRate.id,
            stripeTerminalId: stripeTerminalId,
            stripeLocationId: stripeLocationId,
            type: locationType.RESIDENTIAL,
        };

        store = await factory.create('store', storeData);
        token = getToken(store.id);

        const storeTheme = await factory.create('storeTheme', {
            storeId: store.id,
            businessId: laundromatBusiness.id,
        });

        const spyderWashSettings = await factory.create('spyderWashSettings', {
            storeId: store.id,
        });
        await BusinessSettings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ hasConvenienceFee: false });

        const tipSetting = await factory.create('tipSetting', {
            businessId: laundromatBusiness.id,
        });

        const cciSetting = await factory.create('cciSetting', {
            storeId: store.id,
        });

        const stripeReader = {
            location: stripeLocationId,
            device_type: 'bbpos_wisepos_e',
            status: 'online',
        };
        sinon.stub(stripe.terminal, 'readers').value({
            list: () => ({
                data: [stripeReader],
            }),
        });

        const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);

        res.should.have.status(200);
        assert.equal(res.body.store.id, store.id);
        assert.equal(res.body.store.name, store.name);
        assert.equal(res.body.store.type, store.type);
        assert.equal(res.body.store.phoneNumber, store.phoneNumber);
        assert.equal(res.body.store.stripeLocationId, stripeLocationId);
        assert.equal(res.body.store.stripeTerminalId, stripeTerminalId);
        assert.equal(res.body.businessSettings.tipSettings.id, tipSetting.id);
        assert.equal(res.body.businessSettings.tipSettings.businessId, tipSetting.businessId);
        assert.equal(res.body.businessSettings.tipSettings.tipType, tipSetting.tipType);
        expect(res.body.stripeReaders[0]).to.include(stripeReader);
        expect(res.body.business).to.include(laundromatBusiness);
        expect(res.body.cciSettings).to.include(cciSetting);
        expect(res.body.spyderWashSettings).to.include(spyderWashSettings);
        expect(res.body.taxRate).to.include(taxRate);
        expect(some(res.body.store.storeTheme, storeTheme)).to.be.true;

        // alternative
        expect(res.body.region).to.be.empty;
        expect(res.body.scaleDevices).to.be.empty;
        expect(res.body.employees).to.be.empty;
        expect(res.body.businessSettings.convenienceFee).to.be.null;
    });
});
