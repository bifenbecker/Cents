require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

describe('test /api/v1/employee-tab/scale-device/store/attach', () => {
    const apiAttachEndPoint = '/api/v1/employee-tab/scale-device/store/attach';

    let store, token, business, scaleDevice, scaleDeviceWithStore, scaleDeviceTwo;

    beforeEach(async () => {
        await factory.create('role', { userType: 'Super Admin' });
        const user = await factory.create('userWithSuperAdminRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        store = await factory.create('store', { businessId: business.id });
        token = await generateToken({ id: store.id });

        scaleDevice = await factory.create('scaleDevice');
    });

    describe('test failing cases', async () => {
        it('should fail if pinNumber is not sent', async () => {
            const res = await ChaiHttpRequestHelper.post(apiAttachEndPoint).set('authtoken', token);
            const { error } = res.body;

            expect(error).to.equal('child "pinNumber" fails because ["pinNumber" is required]');
        });

        it('should fail if the ScaleDevice pinNumber is not on the db', async () => {
            const unknownPinNumber = '123456789';
            const res = await ChaiHttpRequestHelper.post(apiAttachEndPoint, null, {
                pinNumber: unknownPinNumber,
            }).set('authtoken', token);
            const { error } = JSON.parse(res.text);

            res.should.have.status(409);
            expect(error).to.equal(
                'We could not find the ScaleDevice you are trying to add to your store in our system. Please contact Cents Support for help!',
            );
        });

        it('should fail if scaleDevice pinNumber is number', async () => {
            const res = await ChaiHttpRequestHelper.post(apiAttachEndPoint, null, {
                pinNumber: 123456789,
            }).set('authtoken', token);

            const { error } = JSON.parse(res.text);

            res.should.have.status(422);
            expect(error).to.equal(
                'child "pinNumber" fails because ["pinNumber" must be a string]',
            );
        });

        it('should fail if scaleDevice pinNumber is empty string', async () => {
            const res = await ChaiHttpRequestHelper.post(apiAttachEndPoint, null, {
                pinNumber: '',
            }).set('authtoken', token);

            const { error } = JSON.parse(res.text);

            res.should.have.status(422);
            expect(error).to.equal(
                'child "pinNumber" fails because ["pinNumber" is not allowed to be empty]',
            );
        });

        it('should fail if sent scaleDevice deviceUuid instead of pinNumber', async () => {
            const res = await ChaiHttpRequestHelper.post(apiAttachEndPoint, null, {
                pinNumber: scaleDevice.deviceUuid,
            }).set('authtoken', token);
            const { error } = JSON.parse(res.text);

            res.should.have.status(409);
            expect(error).to.equal(
                'We could not find the ScaleDevice you are trying to add to your store in our system. Please contact Cents Support for help!',
            );
        });
    });

    describe('add new scaleDevice to a store', async () => {
        it('should map new scaleDevice to store', async () => {
            const res = await ChaiHttpRequestHelper.post(apiAttachEndPoint, null, {
                pinNumber: scaleDevice.pinNumber,
            }).set('authtoken', token);

            const {
                success,
                scaleDevice: { id, pinNumber, deviceUuid },
            } = res.body;

            expect(success).to.be.true;
            expect(id).to.equal(scaleDevice.id);
            expect(pinNumber).to.equal(scaleDevice.pinNumber);
            expect(deviceUuid).to.equal(scaleDevice.deviceUuid);
        });
    });
});
