require('./../../testHelper');
const factory = require('./../../factories');
const { expect } = require('./../../support/chaiHelper');
const validateEmployeeCode = require('../../../validations/validateEmployeeCode');

describe('test validateEmployeeCode validation', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });
    });

    it('should throw an error if roles is absent', async () => {
        const teamMember = await factory.create('teamMember', { businessId: business.id });
        const employeeCode = teamMember.employeeCode;
        expect(validateEmployeeCode(employeeCode)).to.be.rejectedWith(
            `Cannot read property 'roleName' of undefined`,
        );
    });

    it('should throw an error if employeeCode is absent', async () => {
        expect(validateEmployeeCode()).to.be.rejectedWith(`Employee Code is required.`);
    });

    it('should throw an error if businessId is absent', async () => {
        const user = await factory.create('user');
        const role = await factory.create('role', { userType: 'user' });
        await factory.create('userRole', {
            userId: user.id,
            roleId: role.id,
        });
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const employeeCode = teamMember.employeeCode,
            businessId = NaN;
        await expect(validateEmployeeCode(employeeCode, businessId)).to.be.rejected;
    });

    it('should throw an error if storeId is absent', async () => {
        const user = await factory.create('user');
        const role = await factory.create('role', { userType: 'user' });
        await factory.create('userRole', {
            userId: user.id,
            roleId: role.id,
        });
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const employeeCode = teamMember.employeeCode,
            businessId = business.id,
            storeId = NaN;
        await expect(validateEmployeeCode(employeeCode, businessId, storeId)).to.be.rejected;
    });

    it('should throw an error if employeeCode is invalid', async () => {
        const employeeCode = -1,
            businessId = business.id,
            storeId = store.id;
        expect(validateEmployeeCode(employeeCode, businessId, storeId)).to.be.rejectedWith(
            `Invalid employee code`,
        );
    });

    it('should throw an error if user without owner role', async () => {
        const role = await factory.create('role', { userType: 'user' });
        const user = await factory.create('user');
        await factory.create('userRole', {
            userId: user.id,
            roleId: role.id,
        });
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const employeeCode = teamMember.employeeCode,
            businessId = business.id,
            storeId = store.id;
        await expect(validateEmployeeCode(employeeCode, businessId, storeId)).to.be.rejectedWith(
            `You are not authorized to check-in in at this store.`,
        );
    });
});
