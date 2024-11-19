require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories')
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const employeeDetailsQuery = require('../../../queryHelpers/employeeDetailsQuery');

describe('test employeeDetailsQuery', () => {
    let store, user;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        user = await factory.create(FN.user);
    });

    it('should return an empty array if employeeCode is not found', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: store.businessId,
        });
        const result = await employeeDetailsQuery('', store.businessId);
        expect(result.length).to.eq(0);
    });

    it('should return an empty array if businessId is not found', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            employeeCode: '123',
        });
        const result = await employeeDetailsQuery(teamMember.employeeCode, -1);
        expect(result.length).to.eq(0);
    });

    it('should get employee details successfully', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            employeeCode: '123',
            businessId: store.businessId,
        });
        const result = await employeeDetailsQuery(teamMember.employeeCode, store.businessId);
        expect(result.length).to.eq(1);
        expect(result[0].firstname).to.eq(user.firstname);
        expect(result[0].lastname).to.eq(user.lastname);
    });
});
