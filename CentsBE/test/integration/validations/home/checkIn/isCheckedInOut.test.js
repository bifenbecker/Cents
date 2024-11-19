require('./../../../../testHelper');
const isEmployeeCheckedIn = require('./../../../../../validations/employeeTab/home/checkIn/isCheckedInOut');
const factory = require('./../../../../factories');
const { expect } = require('./../../../../support/chaiHelper');

describe('test isEmployeeCheckedIn validation', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });
    });

    it('should return valid status with falsy isCheckedIn and sameStoreCheckOut if an employee is not checked in store', async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const anotherBusiness = await factory.create('laundromatBusiness');
        const anotherStore = await factory.create('store', {
            businessId: anotherBusiness.id,
        });
        await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: anotherStore.id,
            isCheckedIn: false,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });

        const res = await isEmployeeCheckedIn(teamMember.id, store.id);

        expect(res.valid).to.equal(true);
        expect(res.isCheckedIn).to.equal(false);
        expect(res.sameStoreCheckOut).to.equal(false);
        expect(res.storeId).to.equal(store.id);
    });

    it('should throw an error if an employee is already checked in another store', async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const anotherBusiness = await factory.create('laundromatBusiness');
        const anotherStore = await factory.create('store', {
            businessId: anotherBusiness.id,
        });
        await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: anotherStore.id,
            isCheckedIn: true,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });

        const res = await isEmployeeCheckedIn(teamMember.id, store.id);

        expect(res.error).to.equal(true);
        expect(res.sameStoreCheckOut).to.equal(false);
        expect(res.storeId).to.equal(store.id);
        expect(res.message).to
            .equal(`You are already checked in at another store. Please check out from the last
                     store where you had checked-in`);
    });

    it('should throw an error if teamMemberId is not correct values', async () => {
        const teamMemberId = NaN;
        expect(isEmployeeCheckedIn(teamMemberId)).to.be.rejected;
    });

    it('should throw an error if storeId is not correct values', async () => {
        const teamMemberId = 1,
            storeId = NaN;
        expect(isEmployeeCheckedIn(teamMemberId, storeId)).to.be.rejected;
    });

    it('should return valid response if stores correspond', async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });

        const res = await isEmployeeCheckedIn(teamMember.id, store.id);

        expect(res.valid).to.equal(true);
        expect(res.isCheckedIn).to.equal(true);
        expect(res.sameStoreCheckOut).to.equal(true);
        expect(res.storeId).to.equal(store.id);
    });
});
