require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createPaymentRelations,
    getSumTotalOfPayments,
} = require('../../../support/createPaymentsHelper');

// models
const CashOutEvent = require('../../../../models/cashOutEvent');

/**
 * Retrieve the token required for employee app middleware
 *
 * @param {Number} storeId
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test cashOutEventController APIs', () => {
    let business, store, teamMember, token, cashActionAmount;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        teamMember = await factory.create('teamMember', { businessId: business.id });
        store = await factory.create('store', { businessId: business.id });
        token = await getToken(store.id);
        cashActionAmount = 100;
    });

    describe('test API to create a cash out event', () => {
        const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-out/create';

        it('should throw an error if token is not sent', async () => {
            const body = {
                employeeCode: teamMember.employeeCode.toString(),
                cashActionAmount: cashActionAmount.toString(),
                type: 'OUT',
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set(
                'authtoken',
                '',
            );
            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const body = {
                employeeCode: teamMember.employeeCode.toString(),
                cashActionAmount: cashActionAmount.toString(),
                type: 'OUT',
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(403);
        });

        it('should return 422 error for invalid employee code where code is not a string', async () => {
            const body = {
                employeeCode: teamMember.employeeCode,
                cashActionAmount: cashActionAmount.toString(),
                type: 'OUT',
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(422);
        });

        it('should return 422 error for invalid cashActionAmount where value is not a string', async () => {
            const body = {
                employeeCode: teamMember.employeeCode.toString(),
                cashActionAmount,
                type: 'OUT',
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(422);
        });

        it('should return 422 error for invalid type where value is a number', async () => {
            const body = {
                employeeCode: teamMember.employeeCode.toString(),
                cashActionAmount: cashActionAmount.toString(),
                type: 2,
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(422);
        });

        it('should return 422 error if required value is missing', async () => {
            const body = {
                employeeCode: teamMember.employeeCode.toString(),
                type: 'OUT',
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set(
                'authtoken',
                token,
            );
            res.should.have.status(422);
        });

        it('should create a cashOutEvent successfully for the first time for the store', async () => {
            await factory.create('cashDrawerStartEvent', {
                employeeCode: teamMember.employeeCode.toString(),
                teamMemberId: teamMember.id,
                storeId: store.id,
                startingCashAmount: 5000,
                createdAt: new Date('4-4-2022').toISOString(),
            });
            const paymentDate = new Date('4-6-2022').toISOString();
            const { payments } = await createPaymentRelations(5, store.id, paymentDate, 'cash', teamMember);
            const body = {
                employeeCode: teamMember.employeeCode.toString(),
                cashActionAmount: cashActionAmount.toString(),
                type: 'OUT',
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set(
                'authtoken',
                token,
            );

            // verify response has cashDrawerEvent and status
            expect(res.body.success).to.equal(true);
            expect(res.body.cashOutEvent).to.exist;

            // verify data is correct
            const cashOutEvent = await CashOutEvent.query()
                .where({
                    storeId: store.id,
                    employeeCode: teamMember.employeeCode,
                    teamMemberId: teamMember.id,
                })
                .first();
            expect(res.body.cashOutEvent.id).to.equal(cashOutEvent.id);
            expect(res.body.cashOutEvent.totalCashChanged).to.equal(cashActionAmount * 100);

            // expect amountLeftInDrawer to equal cash payment sum minus cash out amount
            const expectedCashAmounts = getSumTotalOfPayments(payments);
            expect(res.body.cashOutEvent.totalCashPaymentSum).to.equal(expectedCashAmounts * 100);
            expect(res.body.cashOutEvent.amountLeftInDrawer).to.equal(
                Number(expectedCashAmounts * 100) - Number(cashActionAmount * 100),
            );
        });
    });

    describe('test API to get the current cash balance', () => {
        const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-out/balance';

        it('should throw an error if token is not sent', async () => {
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {}, {}).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {}, {}).set(
                'authtoken',
                token,
            );
            res.should.have.status(403);
        });

        it('should retrieve the cash balance since last cash out event', async () => {
            await factory.create('cashOutEvent', {
                employeeCode: teamMember.employeeCode.toString(),
                teamMemberId: teamMember.id,
                storeId: store.id,
                totalCashChanged: 5000,
                amountLeftInDrawer: 2000,
                type: 'OUT',
                createdAt: new Date('4-5-2022').toISOString(),
            });
            const paymentDate = new Date('4-6-2022').toISOString();
            const { payments } = await createPaymentRelations(5, store.id, paymentDate, 'cash', teamMember);
            const res = await ChaiHttpRequestHepler.get(apiEndPoint).set('authtoken', token);

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);

            // verify that the cash balances add up
            const expectedCashBalance = getSumTotalOfPayments(payments);
            expect(res.body.currentCashBalance).to.equal(Number(expectedCashBalance * 100));
        });
    });

    describe('test API to get the latest CashOutEvent', () => {
        const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-out/latest';

        it('should throw an error if token is not sent', async () => {
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {}, {}).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {}, {}).set(
                'authtoken',
                token,
            );
            res.should.have.status(403);
        });

        it('should retrieve the latest created CashOutEvent', async () => {
            await factory.create('cashOutEvent', {
                employeeCode: teamMember.employeeCode.toString(),
                teamMemberId: teamMember.id,
                storeId: store.id,
                totalCashChanged: 5000,
                amountLeftInDrawer: 2000,
                type: 'OUT',
                createdAt: new Date('4-5-2022').toISOString(),
            });
            const latestCashOutEvent = await factory.create('cashOutEvent', {
                employeeCode: teamMember.employeeCode.toString(),
                teamMemberId: teamMember.id,
                storeId: store.id,
                totalCashChanged: 1000,
                amountLeftInDrawer: 1000,
                type: 'OUT',
                createdAt: new Date('4-6-2022').toISOString(),
            });
            const res = await ChaiHttpRequestHepler.get(apiEndPoint).set('authtoken', token);

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);

            // verify that expected data is returned
            const expectedCashOutEvent = await CashOutEvent.query()
                .where({
                    storeId: store.id,
                })
                .orderBy('createdAt', 'desc')
                .first();
            expect(res.body.cashOutEvent.id).to.equal(expectedCashOutEvent.id);
            expect(expectedCashOutEvent.id).to.equal(latestCashOutEvent.id);
        });
    });
});
