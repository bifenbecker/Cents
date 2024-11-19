require('./../../../../testHelper');
const ChaiHttpRequestHelper = require('./../../../../support/chaiHttpRequestHelper');
const {
    assertPostResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('./../../../../support/apiTestHelper');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const factory = require('./../../../../factories');
const { expect } = require('./../../../../support/chaiHelper');
const BusinessSettings = require('../../../../../models/businessSettings');
const {
    createPaymentRelations,
    createInventoryOrderPaymentRelations,
} = require('../../../../support/createPaymentsHelper');

describe('test checkOut endpoint', () => {
    const apiEndPoint = '/api/v1/employee-tab/home/check-out';
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

    itShouldCorrectlyAssertTokenPresense(assertPostResponseError, () => apiEndPoint);

    it('should return success status and checkout', async () => {
        const orderDate = new Date('4-6-2022').toISOString();
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
        await BusinessSettings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: true });
        await createPaymentRelations(2, store.id, orderDate, 'cash', teamMember);
        await createInventoryOrderPaymentRelations(2, store.id, orderDate, 'cash', teamMember);
        await createInventoryOrderPaymentRelations(1, store.id, orderDate, 'cashCard', teamMember);

        const body = { employeeCode: teamMember.employeeCode };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        expect(res.status).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.teamMemberName).to.equal(`${user.firstname} ${user.lastname}`);
        expect(res.body.data.totalHoursWorked.length).to.not.equal(0);
        expect(res.body.data.cashTransactions.length).to.not.equal(0);
        expect(res.body.data.cashCardTransactions).to.not.equal(0);
        expect(res.body.data).to.haveOwnProperty('cashCardTotal');
        expect(res.body.data).to.haveOwnProperty('cashTotal');
        expect(res.body.data).to.haveOwnProperty('checkInTime');
        expect(res.body.data).to.haveOwnProperty('checkOutTime');
        expect(res.body.data).to.haveOwnProperty('creditCardTotal');
        expect(res.body.data).to.haveOwnProperty('creditCardTransactions');
        expect(res.body.data).to.haveOwnProperty('isEmployeeCodeRequired');
        expect(res.body.data).to.haveOwnProperty('shiftDate');
        expect(res.body.data).to.haveOwnProperty('totalOrdersProcessed');
        expect(res.body.data).to.haveOwnProperty('totalPoundsProcessed');
    });
});
