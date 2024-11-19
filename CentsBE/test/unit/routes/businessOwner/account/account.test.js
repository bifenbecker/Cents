const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../../support/chaiHelper');
const getAccountInfo = require('../../../../../routes/businessOwner/account/info');
const generateIntercomHash = require('../../../../../utils/generateIntercomHash');

describe('test /api/v1/business-owner/account', () => {
    let user;

    beforeEach(async () => {
        user = await factory.create(FN.user);
    });

    it('current user not found', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({});
        await getAccountInfo(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(403)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0])
            .to.haveOwnProperty('error')
            .to.be.eq('User not found');
    });

    it('should return current user', async () => {
        const laundromatBusiness = await factory.create(
            FN.laundromatBusiness,
            { userId: user.id }
        );
    
        await factory.create(FN.teamMember, {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });

        const intercomHash = generateIntercomHash(user.uuid);

        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            currentUser: user,
        });

        await getAccountInfo(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(200, response => {
            expect(response).to.have.property('userId').equal(user.id);
            expect(response).to.have.property('email').equal(user.email);
            expect(response).to.have.property('firstName').equal(user.firstname);
            expect(response).to.have.property('lastName').equal(user.lastname);
            expect(response).to.have.property('isGlobalVerified').equal(user.isGlobalVerified);
            expect(response).to.have.property('uuid').equal(user.uuid);
            expect(response).to.have.property('intercomHash').equal(intercomHash);
            expect(response).to.have.property('business');
            expect(response.business).to.have.property('uuid').equal(laundromatBusiness.uuid);
            expect(response.business).to.have.property('id').equal(laundromatBusiness.id);
        });
    });
});
