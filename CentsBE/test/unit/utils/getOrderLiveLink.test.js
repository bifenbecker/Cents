const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const getOrderLiveLink = require('../../../utils/getOrderLiveLink');
const { expect } = require('../../support/chaiHelper');
const {
  createMiddlewareMockedArgs,
} = require('../../support/mockers/createMiddlewareMockedArgs');

const secretKeyMock = 'secret';
const liveLinkMock = 'http://test-live-link/';
const requestMock = {
  params: {
    id: '23234',
  }
};

describe('test getOrderLiveLink util', () => {

    beforeEach(() => {
      const sandbox = sinon.createSandbox();
      
      sandbox.stub(process.env, 'JWT_SECRET_TOKEN_ORDER').value(secretKeyMock);
      sandbox.stub(process.env, 'LIVE_LINK').value(liveLinkMock);
    });

    it('should return url', () => {
      const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(requestMock);

      getOrderLiveLink(mockedReq, mockedRes, mockedNext);

      expectedResponseCall(200, response => {
        expect(response).to.have.property('success', true);
        expect(response).to.have.property('url');
      });
    });

    it('should return url with correct live link', () => {
      const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(requestMock);

      getOrderLiveLink(mockedReq, mockedRes, mockedNext);

      expectedResponseCall(200, ({ url }) => {
        expect(url).to.contain(liveLinkMock);
      });
    });

    it('should return url with correct token', () => {
      const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(requestMock);
      const expectedToken = jwt.sign({ id: requestMock.params.id }, secretKeyMock);

      getOrderLiveLink(mockedReq, mockedRes, mockedNext);

      expectedResponseCall(200, ({ url }) => {
        expect(url).to.contain(expectedToken);
      });
    });
});
