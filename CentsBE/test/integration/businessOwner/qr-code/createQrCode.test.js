const { expect } = require('../../../support/chaiHelper');

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');

const factory = require('../../../factories');
const {
    createQrCode,
} = require('../../../../routes/businessOwner/qr-code/machineQrCodeController');

const apiEndpoint = '/api/v1/business-owner/qr-code/create';

describe(apiEndpoint, () => {
    describe('with failed authentication', () => {
        it('should respond 401 code if token is empty', async () => {
            const res = await ChaiHttpRequestHelper.post(apiEndpoint);
            res.should.have.status(401);
        });

        it('should respond 403 if authtoken is not valid', async () => {
            const token = generateToken({
                id: 1231412,
            });
            const res = await ChaiHttpRequestHelper.post(apiEndpoint).set('authtoken', token);
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

        it('should response with a 400 code if qrCodeHash is not provided', async () => {
            const res = await ChaiHttpRequestHelper.post(apiEndpoint).set('authtoken', token);
            res.should.have.status(400);
            res.body.should.be.eql({ message: 'qrCodeHash is required' });
        });

        it('should response with a 400 code if qrCodeHash is not valid', async () => {
            const body = { qrCodeHash: '1' };
            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(400);
            res.body.should.be.eql({ message: 'qrCodeHash is not valid' });
        });

        it('should response with 200 if qr code will be created', async () => {
            const body = { qrCodeHash: '12345' };
            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body).set(
                'authtoken',
                token,
            );

            res.should.have.status(200);
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('hash').eql(body.qrCodeHash);
            expect(res.body).to.have.property('machineId').eql(null);
            expect(res.body).to.have.property('createdAt');
            expect(res.body).to.have.property('updatedAt');
        });

        it('should catch error if req and res does not exist', async () => {
            await createQrCode('', '', () => {}).then((error) => {
                expect(error).to.be.undefined;
            });
        });
    });
});
