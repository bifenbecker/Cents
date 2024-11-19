require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const validateRoleUow = require('../../../../uow/archive/validateRoleUow');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { USER_TYPES } = require('../../../../constants/constants');

const createValidateRoleFactories = async (userType = USER_TYPES.BUSINESS_OWNER) => {
    const user = await factory.create(FACTORIES_NAMES.user);
    const role = await factory.create(FACTORIES_NAMES.role, {
        userType,
    });
    await factory.create(FACTORIES_NAMES.userRole, {
        userId: user.id,
        roleId: role.id,
    });
    const teamMember = await factory.create(FACTORIES_NAMES.teamMember, { userId: user.id });

    return {
        modelId: teamMember.id,
        userType: role.userType,
    };
};

describe('validateRoleUow test', function () {
    it('should throw error if invalid payload passed', async () => {
        await expect(validateRoleUow()).to.be.rejected;
        await expect(validateRoleUow({})).to.be.rejected;
        await expect(validateRoleUow(null)).to.be.rejected;
    });

    it('should throw error if current user has no permissions to archive employees', async () => {
        const { modelId } = await createValidateRoleFactories();
        const payload = {
            modelId,
            currentUserRole: USER_TYPES.EMPLOYEE,
        };

        await expect(validateRoleUow(payload, () => {})).to.be.rejectedWith(
            'You have no permissions to archive user',
        );
    });

    it('should throw error if user you want to archive is higher in hierarchy', async () => {
        const { userType, modelId } = await createValidateRoleFactories();

        const payload = {
            modelId,
            currentUserRole: USER_TYPES.BUSINESS_ADMIN,
        };

        await expect(validateRoleUow(payload, () => {})).to.be.rejectedWith(
            `${payload.currentUserRole} have no permissions to archive other ${userType}`,
        );
    });

    it('should throw error if user you want to archive have the same role', async () => {
        const { userType, modelId } = await createValidateRoleFactories();

        const payload = {
            modelId,
            currentUserRole: USER_TYPES.BUSINESS_OWNER,
        };

        await expect(validateRoleUow(payload, () => {})).to.be.rejectedWith(
            `${payload.currentUserRole} have no permissions to archive other ${userType}`,
        );
    });

    it('should successfully return a payload', async () => {
        const { modelId } = await createValidateRoleFactories(USER_TYPES.EMPLOYEE);

        const payload = {
            modelId,
            currentUserRole: USER_TYPES.BUSINESS_OWNER,
        };
        const res = await validateRoleUow(payload);
        expect(res).deep.equal(payload);
    });
});
