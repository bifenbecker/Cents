require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const {
    pairMachineWithQrCode,
} = require('../../../../routes/businessOwner/qr-code/machineQrCodeController');

const apiEndpoint = '/api/v1/business-owner/qr-code/pair';

describe(apiEndpoint, () => {
    describe('with failed authentication', () => {
        it('should respond 401 code if token is empty', async () => {
            const res = await ChaiHttpRequestHelper.put(apiEndpoint);
            res.should.have.status(401);
        });

        it('should respond 403 if authtoken is not valid', async () => {
            const token = generateToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.put(apiEndpoint).set('authtoken', token);
            res.should.have.status(403);
        });
    });

    describe('with right authentication', () => {
        let token;
        let qrCode;
        beforeEach(async () => {
            const user = await factory.create('userWithBusinessOwnerRole');
            token = generateToken({
                id: user.id,
            });
            qrCode = await factory.create(FACTORIES_NAMES.machineQrCode);
        });

        it('should response 400 code if machineId and qrCodeHash are not provided', async () => {
            const res = await ChaiHttpRequestHelper.put(apiEndpoint).set('authtoken', token);
            res.should.have.status(400);
            res.body.should.be.eql({ message: 'machineId and qrCodeHash are required' });
        });

        it('should response 400 code if machineId is provided but qrCodeHash not', async () => {
            const body = { machineId: '1' };
            const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(400);
            res.body.should.be.eql({ message: 'machineId and qrCodeHash are required' });
        });

        it('should response 400 code if qrCodeHash is provided but machineId is not', async () => {
            const body = { qrCodeHash: qrCode.hash };
            const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(400);
            res.body.should.be.eql({ message: 'machineId and qrCodeHash are required' });
        });

        it('should response 404 code if qrCodeHash does not exist', async () => {
            const body = { qrCodeHash: '1234', machineId: 1 };
            const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(404);
            res.body.should.be.eql({ message: 'Qr Code does not exist' });
        });

        it('should response 404 code if machine does not exist', async () => {
            const body = { qrCodeHash: qrCode.hash, machineId: 100 };
            const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(404);
            res.body.should.be.eql({ message: 'Machine does not exist' });
        });

        it('should response 409 code if QR Code is already paired', async () => {
            const machine = await factory.create(FACTORIES_NAMES.machine, { id: 2 });
            await factory.create(FACTORIES_NAMES.machineQrCode, {
                id: 2,
                hash: '12346',
                machineId: machine.id,
            });
            const body = { qrCodeHash: '12346', machineId: 1 };
            const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(409);
            res.body.should.be.eql({ message: 'Qr Code is already paired' });
        });

        it('should response 409 code if another qr code paired with this machine', async () => {
            const machine = await factory.create(FACTORIES_NAMES.machine, { id: 2 });
            await factory.create(FACTORIES_NAMES.machineQrCode, {
                id: 2,
                hash: '12346',
                machineId: machine.id,
            });
            const body = { qrCodeHash: '12345', machineId: machine.id };
            const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(409);
            res.body.should.be.eql({
                message: 'Another Qr Code is already paired with this machine',
            });
        });

        it('should response 200 code if qr code paired successfully', async () => {
            const machine = await factory.create(FACTORIES_NAMES.machine);
            const body = { qrCodeHash: '12345', machineId: machine.id };
            const res = await ChaiHttpRequestHelper.put(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(200);
        });

        it('should catch error if req and res does not exist', async () => {
            await pairMachineWithQrCode('', '', () => {}).then((error) => {
                expect(error).to.be.undefined;
            });
        });
    });
});
