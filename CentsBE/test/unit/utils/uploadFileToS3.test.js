require('../../testHelper');
const sinon = require('sinon');
const fs = require('fs');
const { expect } = require('../../support/chaiHelper');
const uploadFileToS3 = require('../../../utils/uploadFileToS3');

describe('test uploadFileToS3', () => {
    it('should upload image to S3', async () => {
        const Bucket = 'Bucket';
        const fsStub = sinon.stub(fs, 'createReadStream').callsFake();
        const promise = sinon.stub().callsFake();
        const upload = sinon.stub().callsFake(() => ({
            promise,
        }));

        uploadFileToS3(
            { path: './index.js' },
            {
                upload,
            },
            Bucket,
        );

        expect(fsStub.called).to.be.true;
        expect(upload.called).to.be.true;
        expect(promise.called).to.be.true;
        expect(upload.getCall(0).args[0]).have.property('Bucket', Bucket);
        expect(upload.getCall(0).args[0]).have.property('Body');
        expect(upload.getCall(0).args[0]).have.property('Key');
    });
});
