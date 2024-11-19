const sinon = require('sinon');
require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');

const generateSubscriptionsListReport = require('../../../../pipeline/reports/generateSubscriptionsListReportPipeline');

const Pipeline = require('../../../../pipeline/pipeline');
describe('test generateSubscriptionsListReport pipeline', () => {
    let stubbedPipelineRun, sandbox;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });
    it('should call Pipeline run', async () => {
        const output = { resp: 'data' };
        stubbedPipelineRun = sandbox.stub(Pipeline.prototype, 'run').returns(output);
        const payload = { some: 'data' };
        const result = await generateSubscriptionsListReport(payload);
        sinon.assert.calledWith(stubbedPipelineRun, payload);
        expect(result).to.equal(output);
    });

    it('should throw error when something fails', async () => {
        stubbedPipelineRun = sandbox
            .stub(Pipeline.prototype, 'run')
            .returns(new Error('Pipeline error!'));
        const payload = { some: 'data' };
        const result = await generateSubscriptionsListReport(payload);
        sinon.assert.calledWith(stubbedPipelineRun, payload);
        expect(result.message).to.eql('Pipeline error!');
    });
});