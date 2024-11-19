const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const validateReportingAcessible = require('../../../../validations/locations/updateReportingAccessible');
const {
  createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');

describe('test validateReportingAcessible', () => {
  let store;

  beforeEach(async () => {
      store = await factory.create(FN.store);
  });

  it('should throw an error if Id is invalid', async () => {
    const req = {
      body: {
        hasAppReportingAccessible: true 
      },
      params: { 
        id: 'test'
      },
    }
    
    const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

    await validateReportingAcessible(mockedReq, mockedRes, mockedNext);

    expectedResponseCall(422, response => {
      expect(response).to.have.property('error', '"id" must be a number');
    });
  });

  it('should throw an error if hasAppReportingAccessible is invalid', async () => {
    const req = {
      body: { 
        hasAppReportingAccessible: 'test' 
      },
      params: { 
        id: store.id 
      },
    }
    
    const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

    await validateReportingAcessible(mockedReq, mockedRes, mockedNext);

    expectedResponseCall(422, response => {
      expect(response).to.have.property('error', '"hasAppReportingAccessible" must be a boolean');
    });
  });

  it('should throw an error if hasAppReportingAccessible is absent', async () => {
    const req = {
      body: {},
      params: {
        id: store.id,
      },
    };
    const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

    await validateReportingAcessible(mockedReq, mockedRes, mockedNext);

    expectedResponseCall(422, response => {
      expect(response).to.have.property('error', '"hasAppReportingAccessible" is required');
    });
  });

  it('should call next() if data is correct', async () => {
    const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
        body: { 
          hasAppReportingAccessible: true,
        },
        params: {
          id: store.id,
        },
    });

    await validateReportingAcessible(mockedReq, mockedRes, mockedNext);
    expectedNextCall();
  });
});
