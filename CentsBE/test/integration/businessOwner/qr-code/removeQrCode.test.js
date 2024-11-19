const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const {
    removeQrCode,
} = require('../../../../routes/businessOwner/qr-code/machineQrCodeController');
const MachineQrCodeModel = require('../../../../models/machineQrCode');

const apiEndpoint = '/api/v1/business-owner/qr-code';

describe(apiEndpoint, () => {
    describe('with failed authentication', () => {
        it('should respond 401 code if token is empty', async () => {
            const res = await ChaiHttpRequestHelper.delete(apiEndpoint);
            res.should.have.status(401);
        });

        it('should respond 403 if authtoken is not valid', async () => {
            const token = generateToken({
                id: 100,
            });
            const res = await ChaiHttpRequestHelper.delete(apiEndpoint).set('authtoken', token);
            res.should.have.status(403);
        });
    });

    describe('with right authentication', () => {
        let token;
        beforeEach(async () => {
            const user = await factory.create('userWithBusinessOwnerRole');
            token = generateToken({
                id: user.id,
            });
        });

        it('should respond 404 if qrCode does not exist', async () => {
            const res = await ChaiHttpRequestHelper.delete(`${apiEndpoint}/1`).set(
                'authtoken',
                token,
            );
            res.should.have.status(404);
        });

        describe('when deleting qrCode', () => {
            it('should respond 200 if qrCode successfully deleted', async () => {
                const qrCode = await factory.create(FACTORIES_NAMES.machineQrCode);
                const res = await ChaiHttpRequestHelper.delete(`${apiEndpoint}/${qrCode.id}`).set(
                    'authtoken',
                    token,
                );

                const updatedQrCode = await MachineQrCodeModel.query().findOne({ id: qrCode.id });
                expect(updatedQrCode.deletedAt).to.not.be.null;

                res.should.have.status(200);
            });

            it('should respond 404 if qrCode is already deleted', async () => {
                const qrCode = await factory.create(FACTORIES_NAMES.machineQrCode);
                await ChaiHttpRequestHelper.delete(`${apiEndpoint}/${qrCode.id}`).set(
                    'authtoken',
                    token,
                );

                const res = await ChaiHttpRequestHelper.delete(`${apiEndpoint}/${qrCode.id}`).set(
                    'authtoken',
                    token,
                );
                const updatedQrCode = await MachineQrCodeModel.query().findOne({ id: qrCode.id });

                expect(updatedQrCode.deletedAt).to.not.be.null;
                res.should.have.status(404);
            });
        });

        it('should catch error if req and res does not exist', async () => {
            await removeQrCode('', '', () => {}).then((error) => {
                expect(error).to.be.undefined;
            });
        });
    });
});
