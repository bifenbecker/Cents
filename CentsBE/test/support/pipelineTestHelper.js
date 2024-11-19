const sinon = require('sinon');
const ChaiHttpRequestHelper = require('./chaiHttpRequestHelper');
const Pipeline = require('../../pipeline/pipeline');

const endpointPipelineMock = async ({ pipelineReturn, method, apiEndpoint, params, body, headers = {} }) => {
    const sandbox = sinon.createSandbox();
    const stubbedPipelineRun = sandbox.stub(Pipeline.prototype, 'run').returns(pipelineReturn);
    const response = await ChaiHttpRequestHelper[method](apiEndpoint, params, body).set(headers);
    sandbox.restore();
    return { stubbedPipelineRun, response };
};

const endpointPipelineErrorMock = async ({ method, apiEndpoint, params, body, headers = {}, errorMessage = 'Pipeline error!' }) => {
    const sandbox = sinon.createSandbox();
    const error = new Error(errorMessage);
    sandbox.stub(Pipeline.prototype, 'startTransaction').throws(error);
    sandbox.stub(Pipeline.prototype, 'rollbackTransaction');
    const response = await ChaiHttpRequestHelper[method](apiEndpoint, params, body).set(headers);
    sandbox.restore();
    return response;
};

module.exports = exports = { endpointPipelineMock, endpointPipelineErrorMock };
