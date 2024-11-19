require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { getCustomer } = require('../../../../uow/singleOrder/getCustomer');

describe('test getCustomer', () => {
    const user = {
        id: 1,
        firstName: 'firstName',
        lastName: 'lastName',
        phoneNumber: 12345,
        centsCustomer: {
            id: 2,
            phoneNumber: 54321,
            email: 'asd@gmail.com',
            languageId: 10,
            stripeCustomerId: 3,
            getAddresses: () => {
                return 'adresses';
            },
        },
        email: 'dsa@gmail.com',
        languageId: 5,
        creditAmount: 100,
        notes: 'notes',
        isHangDrySelected: true,
        hangDryInstructions: 'instructions',
    };

    it('should fail in some cases', async () => {
        await expect(getCustomer()).to.be.rejected;
        await expect(getCustomer(null)).to.be.rejected;
        await expect(getCustomer({})).to.be.rejected;
    });

    it('should return details', async () => {
        const details = await getCustomer(user);

        expect(details).to.include({
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`,
            phoneNumber: user.phoneNumber,
            email: user.email,
            languageId: user.languageId,
            storeCustomerId: user.id,
            centsCustomerId: user.centsCustomer.id,
            stripeCustomerId: user.centsCustomer.stripeCustomerId,
            availableCredit: user.creditAmount,
            notes: user.notes,
            isHangDrySelected: user.isHangDrySelected,
            hangDryInstructions: user.hangDryInstructions,
            addresses: user.centsCustomer.getAddresses(),
        });
    });

    it('should return details when some fields are absent', async () => {
        const userFields = {
            ...user,
            phoneNumber: null,
            email: null,
            languageId: null,
            creditAmount: null,
            notes: null,
            isHangDrySelected: null,
        };
        const expectedDetails = {
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`,
            phoneNumber: user.centsCustomer.phoneNumber,
            email: user.centsCustomer.email,
            languageId: user.centsCustomer.languageId,
            storeCustomerId: user.id,
            centsCustomerId: user.centsCustomer.id,
            stripeCustomerId: user.centsCustomer.stripeCustomerId,
            availableCredit: 0,
            notes: '',
            isHangDrySelected: false,
            hangDryInstructions: user.hangDryInstructions,
            addresses: user.centsCustomer.getAddresses(),
        };
        const details = await getCustomer(userFields);
        userFields.centsCustomer.languageId = null;
        const withoutLanguageIdDetails = await getCustomer(userFields);

        expect(details).to.include(expectedDetails);
        expectedDetails.languageId = 1;
        expect(withoutLanguageIdDetails).to.include(expectedDetails);
    });
});
