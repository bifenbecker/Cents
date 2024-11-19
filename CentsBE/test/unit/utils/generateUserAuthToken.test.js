const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const generateUserAuthToken = require('../../../utils/generateUserAuthToken');
const { expect } = require('../../support/chaiHelper');

const userMock = {
  id: 1,
  teamMemberId: 2,
};
const roleMock = {
  roleId: 3,
};
const secretKeyMock = 'secret';

describe('test generateUserAuthToken util', () => {
    let decodedToken;

    beforeEach(() => {
      const sandbox = sinon.createSandbox();
      sandbox.stub(process.env, 'JWT_SECRET_TOKEN').value(secretKeyMock);

      const token = generateUserAuthToken(userMock, roleMock);
      decodedToken = jwt.verify(token, secretKeyMock);
    });

    it('token should have a certain keys', () => {
      expect(decodedToken).to.have.all.keys('id', 'role', 'teamMemberId', 'iat');
    });

    it('token should contains define user id', () => {
        expect(decodedToken.id).to.equal(userMock.id);
    });

    it('token should contains define team member id', () => {
      expect(decodedToken.teamMemberId).to.equal(userMock.teamMemberId);
    });

    it('token should contains define role id', () => {
      expect(decodedToken.role).to.equal(roleMock.roleId);
    });
});