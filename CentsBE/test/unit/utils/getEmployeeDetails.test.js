require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const getEmployeeDetails = require('../../../utils/getEmployeeDetails');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test getEmployeeDetails', () => {
    let store, user;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        user = await factory.create(FN.user);
    });

    it('should be rejected if employeeCode is not found', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: store.businessId,
        });
        const employeeCode = '';
        const businessId = store.businessId;
        await expect(getEmployeeDetails(employeeCode, businessId)).to.be.rejected;
    });

    it('should be rejected array if businessId is not found', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            employeeCode: '123',
        });
        const employeeCode = teamMember.employeeCode;
        const businessId = -1;
        await expect(getEmployeeDetails(employeeCode, businessId)).to.be.rejected;
    });

    it('should get employee details successfully', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            employeeCode: '123',
            businessId: store.businessId,
        });
        const employeeCode = teamMember.employeeCode;
        const businessId = store.businessId;
        const result = await getEmployeeDetails(employeeCode, businessId);
        expect(result.id).to.eq(teamMember.id);
        expect(result.name).to.eq(`${user.firstname} ${user.lastname}`);
        expect(result.employeeCode).to.eq(teamMember.employeeCode);
    });
});
