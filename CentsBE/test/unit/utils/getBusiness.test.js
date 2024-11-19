require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const getBusiness = require('../../../utils/getBusiness');
const factory = require('../../factories');

describe('test getBusiness', () => {
    it('should return business of business owner', async () => {
        const user = await factory.create('userWithBusinessOwnerRole');
        const laundromatBusiness = await factory.create('laundromatBusiness', {
            userId: user.id,
        });
        const teamMember = await factory.create('teamMember', {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
        user.role = 'Business Owner';
        const req = {
            currentUser: user,
        };
        const businessOwner = await getBusiness(req);
        expect(businessOwner.userId).to.eq(laundromatBusiness.userId);
    });

    it('should return business of super admin', async () => {
        const user = await factory.create('userWithSuperAdminRole');
        const laundromatBusiness = await factory.create('laundromatBusiness', {
            userId: user.id,
        });
        const teamMember = await factory.create('teamMember', {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
        user.role = 'Super Admin';
        const req = {
            currentUser: user,
        };
        const superAdmin = await getBusiness(req);
        expect(superAdmin.userId).to.eq(teamMember.userId);
    });

    it('should throw an error if incorrect data', async () => {
        try {
            await getBusiness();
        } catch (error) {
            expect(error.message).to.eq(
                "TypeError: Cannot read property 'currentUser' of undefined",
            );
        }
    });
});
