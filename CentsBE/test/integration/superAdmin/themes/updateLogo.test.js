require('../../../testHelper');
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const S3 = require('aws-sdk/clients/s3');
const { expect } = require('../../../support/chaiHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const server = require('../../../../index');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

chai.use(chaiHttp);

const apiEndpoint = '/api/v1/super-admin/themes/logo';

describe('test updateLogo endpoint', () => {
    let authToken;

    beforeEach(async () => {
        await factory.create(FACTORIES_NAMES.role, { userType: 'Super Admin' });
        const user = await factory.create(FACTORIES_NAMES.userWithSuperAdminRole);
        authToken = generateToken({ id: user.id });
    });

    it('should upload image to S3', async () => {
        const uploadStub = sinon.stub(S3.prototype, 'upload').returns({
            promise: () => {},
        });

        const res = await chai
            .request(server)
            .post(apiEndpoint)
            .attach('logo', './index.js', 'index.js')
            .type('form')
            .set('authtoken', authToken);

        expect(res.status).equal(200);
        expect(uploadStub.called).to.be.true;
    });

    it('should throw Error', async () => {
        const uploadStub = sinon.stub(S3.prototype, 'upload').returns({
            promise: () => {
                throw new Error();
            },
        });

        const res = await chai
            .request(server)
            .post(apiEndpoint)
            .attach('logo', './index.js', 'index.js')
            .type('form')
            .set('authtoken', authToken);

        expect(res.status).equal(500);
        expect(uploadStub.called).to.be.true;
    });
});
