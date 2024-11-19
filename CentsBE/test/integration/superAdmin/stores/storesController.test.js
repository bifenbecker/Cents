require('../../../testHelper');
const chaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const centsDeliverySettings = require('../../../../models/centsDeliverySettings');

const BASE_URL = '/api/v1/super-admin/stores/';

describe('test stores controller', () => {
    describe('test toggle doordash enabled delivery setting', () => {
        let authToken, store, url;
        beforeEach(async () => {
            await factory.create('role', { userType: 'Super Admin' });
            const user = await factory.create('userWithSuperAdminRole');
            const business = await factory.create('laundromatBusiness', { userId: user.id });

            authToken = generateToken({ id: user.id });
            store = await factory.create('store', { businessId: business.id });

            url = `${BASE_URL}/${store.id}/cents-delivery/doordash/update`;
        });

        it('should set doorDashEnabled to TRUE when FALSE', async () => {
            await factory.create('centsDeliverySettings', {
                storeId: store.id,
            });

            const res = await chaiHttpRequestHelper.put(url).set('authtoken', authToken);

            res.should.have.status(200);
            expect(res.body).to.have.property('success', true);

            const settings = await centsDeliverySettings.query().where('storeId', store.id).first();
            settings.should.have.property('doorDashEnabled', true);
        });

        it('should set autoScheduleReturnEnabled to FALSE when TRUE', async () => {
            await factory.create('centsDeliverySettings', {
                storeId: store.id,
                doorDashEnabled: true,
            });

            const res = await chaiHttpRequestHelper.put(url).set('authtoken', authToken);

            res.should.have.status(200);
            expect(res.body).to.have.property('success', true);

            const settings = await centsDeliverySettings.query().where('storeId', store.id).first();
            settings.should.have.property('doorDashEnabled', false);
        });
    });
});
