require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const {
    unpairMachineFromQrCode,
} = require('../../../../routes/businessOwner/qr-code/machineQrCodeController');

const apiEndpoint = '/api/v1/business-owner/qr-code/unpair';

describe(apiEndpoint, () => {
    let token;
    let qrCode;
    let machine;
    beforeEach(async () => {
        const user = await factory.create('userWithBusinessOwnerRole');
        token = generateToken({
            id: user.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machine, { id: 1 });
        qrCode = await factory.create(FACTORIES_NAMES.machineQrCode, {
            id: 1,
            hash: '12345',
            machineId: machine.id,
        });
    });

    it('should response 400 code if machineId and id are not provided', async () => {
        const res = await ChaiHttpRequestHelper.put(apiEndpoint).set('authtoken', token);
        res.should.have.status(400);
        res.body.should.be.eql({ message: 'machineId and id are required' });
    });

    it('should response 400 code if machineId is provided but id not', async () => {
        const body = { machineId: '1' };
        const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set('authtoken', token);
        res.should.have.status(400);
        res.body.should.be.eql({ message: 'machineId and id are required' });
    });

    it('should response 400 code if id is provided but machineId is not', async () => {
        const body = { id: qrCode.id };
        const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set('authtoken', token);
        res.should.have.status(400);
        res.body.should.be.eql({ message: 'machineId and id are required' });
    });

    it('should response 404 code if qr code does not exist', async () => {
        const body = { id: 190, machineId: 1 };
        const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set('authtoken', token);
        res.should.have.status(404);
        res.body.should.be.eql({ message: 'Qr Code does not exist' });
    });

    it('should response 409 code if QR Code is not paired with any machine', async () => {
        const freeQrCode = await factory.create(FACTORIES_NAMES.machineQrCode, {
            id: 120,
            hash: '123123',
        });
        const body = { id: freeQrCode.id, machineId: machine.id };
        const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set('authtoken', token);
        res.should.have.status(409);
        res.body.should.be.eql({ message: 'Qr Code is not paired with any machine' });
    });

    it('should response 409 code if QR Code is paired with another machine', async () => {
        const body = { id: qrCode.id, machineId: 12909 };
        const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set('authtoken', token);
        res.should.have.status(409);
        res.body.should.be.eql({ message: 'Qr Code paired with another machine' });
    });

    it('should response 200 code if qr code paired successfully', async () => {
        const body = { id: qrCode.id, machineId: machine.id };
        const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set('authtoken', token);
        res.should.have.status(200);
    });

    it('should catch error if req and res does not exist', async () => {
        await unpairMachineFromQrCode('', '', () => {}).then((error) => {
            expect(error).to.be.undefined;
        });
    });
});
