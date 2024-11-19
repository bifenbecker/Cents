require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../../support/pipelineTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { generateToken } = require('../../../support/apiTestHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const Shift = require('../../../../models/shifts');
const Timing = require('../../../../models/timings');

describe(`test /api/v1/business-owner/admin/locations/:storeId/shifts/:shiftId API endpoint`, () => {
    const apiEndpointStaticPart = '/api/v1/business-owner/admin/locations';
    let storeId, shiftId, timing, params, token;

    beforeEach(async () => {
        const store = await factory.create(FN.store);
        const shift = await factory.create(FN.shift, {
            storeId: store.id,
        });
        timing = await factory.create(FN.timing, {
            shiftId: shift.id,
        });
        const user = await factory.create('userWithBusinessOwnerRole');
        const business = await factory.create('laundromatBusiness', { userId: user.id });
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
            businessId: business.id,
        });
        token = generateToken({
            id: user.id,
            role: 1,
            teamMemberId: teamMember.id,
        });
        storeId = store.id;
        shiftId = shift.id;
        params = { storeId, shiftId };
    });

    describe('pipeline .run() check with mocked pipeline stages', () => {
        it('Pipeline run should be called and return correct response', async () => {
            const mock = await endpointPipelineMock({
                method: 'delete',
                apiEndpoint: `${apiEndpointStaticPart}/${storeId}/shifts/${shiftId}`,
                params: params,
                body: {},
                headers: {
                    authtoken: token,
                },
                pipelineReturn: {
                    success: true,
                },
            });

            const stubbedPipelineRun = mock.stubbedPipelineRun;
            const response = mock.response;

            expect(stubbedPipelineRun.called).to.be.true;
            response.should.have.status(200);
            response.body.should.have.property('success', true);
        });
    });

    describe('test with full pipeline stages', async () => {
        it('Should return correct response', async () => {
            const activeShift = await Shift.query().findById(shiftId);
            const activeTiming = await Timing.query().findById(timing.id);

            const response = await ChaiHttpRequestHelper.delete(
                `${apiEndpointStaticPart}/${storeId}/shifts/${shiftId}`,
                params,
                {},
            ).set('authtoken', token);

            const removedShift = await Shift.query().findById(shiftId);
            const removedTiming = await Timing.query().findById(timing.id);

            response.should.have.status(200);
            response.body.should.have.property('success', true);
            expect(activeShift.id).to.eql(removedShift.id);
            expect(activeTiming.id).to.eql(removedTiming.id);
            expect(activeShift.deletedAt).to.eql(null);
            expect(typeof Date.parse(removedShift.deletedAt)).to.eql('number');
            expect(activeTiming.isActive).to.eql(true);
            expect(removedTiming.isActive).to.eql(false);
        });
    });

    describe('pipeline error catching test', () => {
        it('Pipeline should catch Error', async () => {
            const response = await endpointPipelineErrorMock({
                method: 'delete',
                apiEndpoint: `${apiEndpointStaticPart}/${storeId}/shifts/${shiftId}`,
                headers: {
                    authtoken: token,
                },
                params,
                body: {},
            });
            response.should.have.status(500);
            expect(response.body).to.eql({
                error: 'Pipeline error!',
            });
        });
    });

    describe('authorization error catching test', () => {
        it('Middleware should catch Error', async () => {
            const response = await endpointPipelineErrorMock({
                method: 'delete',
                apiEndpoint: `${apiEndpointStaticPart}/${storeId}/shifts/${shiftId}`,
                headers: {},
                params,
                body: {},
            });
            response.should.have.status(401);
            expect(response.body).to.eql({
                error: 'Please sign in to proceed.',
            });
        });
    });
});
