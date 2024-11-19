require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const TeamMember = require('../../../../models/teamMember');

const getTeamMember = require('../../../../uow/teamMember/getTeamMemberUow');

describe('test getTeamMemberUow', () => {
    let business, store, user;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        user = await factory.create('user');
    });

    it('should retrieve the TeamMember model with user relation for the given employee code and business', async () => {
        await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
            employeeCode: 1234,
        });
        const payload = {
            employeeCode: 1234,
            store,
        };

        // call Uow
        const uowOutput = await getTeamMember(payload);
        const { teamMember } = uowOutput;

        // assert
        const foundTeamMember = await TeamMember.query()
          .withGraphFetched('user')
          .where({
              employeeCode: payload.employeeCode,
              businessId: business.id,
          })
          .first();
        expect(teamMember).to.exist;
        expect(teamMember).to.deep.equal(foundTeamMember);
    });
});
