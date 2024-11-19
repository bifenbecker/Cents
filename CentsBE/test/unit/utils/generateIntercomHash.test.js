const { createHmac } = require('crypto');
const sinon = require('sinon');
const generateIntercomHash = require('../../../utils/generateIntercomHash');
const { expect } = require('../../support/chaiHelper');

const userUuid = '23Fds4gf-43534sdf23';
const secretKeyMock = 'secret';

describe('test generateIntercomHash util', () => {
    let intercomHash;

    beforeEach(() => {
      const sandbox = sinon.createSandbox();
      sandbox.stub(process.env, 'INTERCOM_SECRET_TOKEN').value(secretKeyMock);

      intercomHash = generateIntercomHash(userUuid);
    });

    it('should equal to the expected hash', () => {
      const expectedIntercomHash = createHmac('sha256', secretKeyMock).update(userUuid).digest('hex');

      expect(intercomHash).to.equal(expectedIntercomHash);
    });
});