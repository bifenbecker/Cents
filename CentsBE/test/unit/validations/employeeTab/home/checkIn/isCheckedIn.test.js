require('../../../../../testHelper');
const { generateToken } = require('../../../../../support/apiTestHelper');
const { FACTORIES_NAMES } = require('../../../../../constants/factoriesNames');
const factory = require('../../../../../factories');
const isCheckedIn = require('../../../../../../validations/employeeTab/home/checkIn/isCheckedIn');
const { expect } = require('../../../../../support/chaiHelper');

describe('test isCheckedIn validation', () => {
    let business, store, token;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        token = generateToken({
            id: store.id,
        });
    });

    it('should return an error status if TeamMembersCheckIn entity is not found', async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: false,
            checkInTime: new Date().toISOString(),
            checkOutTime: new Date().toISOString(),
        });

        const teamMemberId = teamMember.id;
        const storeId = undefined;
        const checkIn = false;

        const result = await isCheckedIn(teamMemberId, storeId, checkIn);

        expect(result.error).to.be.true;
        expect(result.message).to.be.equal('You are not checked in.');
    });

    it('should return an error status if user is already checked in', async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
            checkInTime: new Date().toISOString(),
            checkOutTime: new Date().toISOString(),
        });

        const teamMemberId = teamMember.id;
        const storeId = store.id;
        const checkIn = true;

        const result = await isCheckedIn(teamMemberId, storeId, checkIn);

        expect(result.error).to.be.true;
        expect(result.message).to.be.equal('You are already checked -in.');
    });

    it('should return an error status if user is already checked in another store', async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        const anotherBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        const anotherStore = await factory.create(FACTORIES_NAMES.store, {
            businessId: anotherBusiness.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            storeId: anotherStore.id,
            isCheckedIn: true,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });

        const teamMemberId = teamMember.id;
        const storeId = store.id;
        const checkIn = true;

        const result = await isCheckedIn(teamMemberId, storeId, checkIn);

        expect(result.error).to.be.true;
        expect(result.message).to.be
            .equal(`You are already checked in at another store.Please check out from the last
                     store where you had checked-in`);
        expect(result.address).to.equal(anotherStore.name);
        expect(result.previousStore).to.equal(anotherStore.id);
    });

    it('should return valid status and store id', async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });

        const teamMemberId = teamMember.id;
        const storeId = store.id;
        const checkIn = false;

        const result = await isCheckedIn(teamMemberId, storeId, checkIn);

        expect(result.valid).to.be.true;
        expect(result.previousStore).to.equal(store.id);
    });
});
