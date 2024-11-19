require('../../../../testHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertPatchResponseError,
    assertPatchResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { expect } = require('../../../../support/chaiHelper');
const ServicesMaster = require('../../../../../models/services');
const PromotionProgramItem = require('../../../../../models/promotionProgramItem');

const getApiEndPoint = (serviceId) => `/api/v1/business-owner/admin/services/archive/${serviceId}`;

describe('test archiveService for admin business manager', () => {
    let token, servicesMaster, promotionProgramItem;

    beforeEach(async () => {
        await factory.create(FN.role, { userType: 'Business Owner' });
        const user = await factory.create(FN.userWithBusinessOwnerRole);
        token = generateToken({
            id: user.id,
        });
        servicesMaster = await factory.create(FN.serviceMaster, {
            isDeleted: false,
        });
        promotionProgramItem = await factory.create(FN.promotionProgramItem, {
            promotionItemType: 'ServicesMaster',
            promotionItemId: servicesMaster.id,
            isDeleted: false,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertPatchResponseError, () =>
        getApiEndPoint(servicesMaster.id),
    );

    it('should fail when serviceId is not passed', async () => {
        await assertPatchResponseError({
            url: getApiEndPoint(),
            token,
            body: {},
            code: 422,
            expectedError: '"serviceId" must be a number',
        });
    });

    it(`should fail when service doesn't exist with given id`, async () => {
        const MAX_DB_INTEGER = 2147483647;
        await assertPatchResponseError({
            url: getApiEndPoint(MAX_DB_INTEGER),
            token,
            body: {},
            code: 404,
            expectedError: 'service not found',
        });
    });

    it('should successfully archive service', async () => {
        const serviceId = servicesMaster.id;
        await assertPatchResponseSuccess({
            url: getApiEndPoint(serviceId),
            token,
            body: {},
        });

        const archivedServicesMaster = await ServicesMaster.query().findById(serviceId);
        const archivedPromotionProgramItem = await PromotionProgramItem.query().findById(
            promotionProgramItem.id,
        );
        expect(archivedServicesMaster.isDeleted).to.be.true;
        expect(archivedServicesMaster.deletedAt).to.not.be.null;
        expect(archivedServicesMaster.deletedAt).to.be.a.dateString();
        expect(archivedPromotionProgramItem.isDeleted).to.be.true;
    });

    it('should successfully unarchive service', async () => {
        const archivedServicesMaster = await factory.create(FN.serviceMaster, {
            isDeleted: true,
            deletedAt: new Date().toISOString(),
        });
        const serviceId = archivedServicesMaster.id;
        await assertPatchResponseSuccess({
            url: getApiEndPoint(serviceId),
            token,
            body: {},
        });

        const unarchivedServicesMaster = await ServicesMaster.query().findById(serviceId);
        expect(unarchivedServicesMaster.isDeleted).to.be.false;
        expect(unarchivedServicesMaster.deletedAt).to.be.null;
    });
});
