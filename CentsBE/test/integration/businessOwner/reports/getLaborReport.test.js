require('../../../testHelper');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { expect, chai } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { generateToken } = require('../../../support/apiTestHelper');
const eventEmitter = require('../../../../config/eventEmitter');
const User = require('../../../../models/user');
const Store = require('../../../../models/store');
const { REPORT_TYPES } = require('../../../../constants/constants');

const apiEndpoint = '/api/v1/business-owner/reports/stores/orders/labor';

async function expectDownloadReportEventToBeEmitted(emitSpy, user, options) {
    const expectedRecipient = await User.query().findById(user.id);
    const userRoles = await user.getRoles();

    emitSpy.should.be.deep.called.with('downloadReport', {
        options,
        recipient: expectedRecipient,
        reportType: REPORT_TYPES.laborReport,
    });
}

describe('test getLaborReport api', () => {
    let token, user, emitSpy, stores;
    const now = new Date();

    before(() => {
        emitSpy = chai.spy.on(eventEmitter, 'emit');
    });

    after(() => {
        chai.spy.restore(eventEmitter);
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndpoint);

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        stores = await factory.createMany(FACTORIES_NAMES.store, 2, {
            businessId: business.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    it('should fail if user without owner/admin/manager role tries to get the report', async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        token = generateToken({
            id: user.id,
        });

        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 403,
            expectedError: 'Unauthorized',
        });
    });

    it('should succeed for all stores', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        const { body } = await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
        expect(body).to.have.property('success', true);

        await expectDownloadReportEventToBeEmitted(emitSpy, user, {
            startDate: params.startDate,
            endDate: params.endDate,
            timeZone: params.timeZone,
            stores: [stores[0].id, stores[1].id].sort((a, b) => a - b),
        });
    });

    it('should succeed for a single store', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            stores: [stores[0].id],
        };

        const { body } = await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
        expect(body).to.have.property('success', true);

        await expectDownloadReportEventToBeEmitted(emitSpy, user, params);
    });

    it('should succeed for specific stores', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            stores: [stores[0].id, stores[1].id],
        };

        const { body } = await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
        expect(body).to.have.property('success', true);

        await expectDownloadReportEventToBeEmitted(emitSpy, user, params);
    });

    it('should respond with 400 if business was not found', async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        token = generateToken({
            id: user.id,
        });

        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 400,
            expectedError: 'Business was not found',
        });
    });

    it('should respond with 400 if stores were not found for a business', async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        token = generateToken({
            id: user.id,
        });

        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 400,
            expectedError: 'Stores were not found',
        });
    });
});
