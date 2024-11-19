require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

// models
const CashDrawerStartEvent = require('../../../../models/cashDrawerStartEvent');
const CashDrawerEndEvent = require('../../../../models/cashDrawerEndEvent');

/**
 * Retrieve the token required for employee app middleware
 * 
 * @param {Number} storeId 
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test cashDrawerEventController', () => {
  let business, store, teamMember, token, startingAmount;
  
  beforeEach(async () => {
    business = await factory.create('laundromatBusiness');
    teamMember = await factory.create('teamMember', { businessId: business.id });
    store = await factory.create('store', { businessId: business.id });
    token = await getToken(store.id);
    startingAmount = 5000;
  });

  describe('test API to create cash drawer start event', () => {
      const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-drawer/start';

      it('should throw an error if token is not sent', async () => {
          const body = {
            employeeCode: teamMember.employeeCode.toString(),
            startingCashAmount: startingAmount,
          }
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', '');
          res.should.have.status(401);
      });

      it('should return store not found error', async () => {
          const token = await getToken(0);
          const body = {
            employeeCode: teamMember.employeeCode.toString(),
            startingCashAmount: startingAmount,
          }
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);
          res.should.have.status(403);
      });

      it('should return 422 error for invalid employee code where code is not a string', async () => {
          const body = {
            employeeCode: teamMember.employeeCode,
            startingCashAmount: startingAmount,
          }
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);
          res.should.have.status(422);
      });

      it('should return 422 error for invalid starting amount where value is not a string', async () => {
          const body = {
            employeeCode: teamMember.employeeCode,
            startingCashAmount: 5000,
          }
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);
          res.should.have.status(422);
      });

      it('should create a cashDrawerStartEvent successfully', async () => {
          const body = {
            employeeCode: teamMember.employeeCode.toString(),
            startingCashAmount: startingAmount.toString(),
          }
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);

          // verify response has cashDrawerEvent and status
          expect(res.body.success).to.equal(true);
          expect(res.body.status).to.equal('IN_PROGRESS');

          // verify data is correct
          const cashDrawerEvent = await CashDrawerStartEvent.query()
              .where({
                storeId: store.id,
                employeeCode: teamMember.employeeCode,
                teamMemberId: teamMember.id,
              })
              .first();
          expect(res.body.cashDrawerEvent.id).to.deep.equal(cashDrawerEvent.id);
          
          // expect incoming dollar amount to equal amount stored in cents
          expect(res.body.cashDrawerEvent.startingCashAmount).to.deep.equal(Number(startingAmount * 100));
      });
  });

  describe('test API to create cash drawer end event', () => {
      const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-drawer/end';

      it('should throw an error if token is not sent', async () => {
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, {}).set('authtoken', '');
          res.should.have.status(401);
      });

      it('should return store not found error', async () => {
          const token = await getToken(0);
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, {}).set('authtoken', token);
          res.should.have.status(403);
      });

      it('should return 422 error for invalid employee code where code is not a string', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
          });
          const body = {
            employeeCode: teamMember.employeeCode,
            cashDrawerEventId: cashDrawerStartEvent.id,
            startingCashAmount: startingAmount.toString(),
            actualInDrawer: startingAmount.toString(),
            cashInOut: 0,
          };
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);
          res.should.have.status(422);
      });

      it('should return 422 error for invalid actualInDrawer where amount is not a string', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
          });
          const body = {
            employeeCode: teamMember.employeeCode.toString(),
            cashDrawerEventId: cashDrawerStartEvent.id,
            actualInDrawer: startingAmount,
            cashInOut: 0,
          };
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);
          res.should.have.status(422);
      });

      it('should return 422 error for invalid cashDrawerEventId when not included', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
          });
          const body = {
            employeeCode: teamMember.employeeCode.toString(),
            actualInDrawer: startingAmount,
            cashInOut: 0,
          };
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);
          res.should.have.status(422);
      });

      it('should create a cashDrawerEndEvent successfully', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
          });
          // incoming request is dollar amount for actualInDrawer
          const body = {
            employeeCode: teamMember.employeeCode.toString(),
            cashDrawerEventId: cashDrawerStartEvent.id,
            actualInDrawer: Number(50).toString(),
            cashInOut: 0,
          };
          const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, body).set('authtoken', token);

          // verify response has cashDrawerEvent and status
          expect(res.body.success).to.equal(true);
          expect(res.body.status).to.equal('REQUIRES_START');

          // verify data is correct
          const cashDrawerEvent = await CashDrawerEndEvent.query()
              .where({
                storeId: store.id,
                employeeCode: teamMember.employeeCode,
                teamMemberId: teamMember.id,
              })
              .first();
          expect(res.body.cashDrawerEvent.id).to.deep.equal(cashDrawerEvent.id);
          
          // expect ending drawer amounts to equal starting amounts if no cash sales present
          expect(res.body.cashDrawerEvent.expectedInDrawer).to.deep.equal(
              Number(cashDrawerStartEvent.startingCashAmount),
          );
          expect(res.body.cashDrawerEvent.actualInDrawer).to.deep.equal(
              Number(cashDrawerStartEvent.startingCashAmount),
          );
      });
  });

  describe('test API to get cash drawer status', () => {
      const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-drawer/status';

      it('should throw an error if token is not sent', async () => {
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}, {}).set('authtoken', '');
          res.should.have.status(401);
      });

      it('should return store not found error', async () => {
          const token = await getToken(0);
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}, {}).set('authtoken', token);
          res.should.have.status(403);
      });

      it('should retrieve REQUIRES_START status successfully when no events exist', async () => {
          const business = await factory.create('laundromatBusiness');
          const store = await factory.create('store', { businessId: business.id });
          const token = await getToken(store.id);
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`).set(
              'authtoken',
              token,
          );
          
          // verify 200 status and other values
          res.should.have.status(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.status).to.equal('REQUIRES_START');
          expect(res.body.currentDrawer).to.deep.equal({});
          expect(res.body.startEvent).to.equal(undefined);
          expect(res.body.endEvent).to.equal(undefined);
      });

      it('should retrieve IN_PROGRESS status successfully when only start event exist', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
          });
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`).set(
              'authtoken',
              token,
          );
          
          // verify 200 status
          res.should.have.status(200);

          // verify body values
          expect(res.body.success).to.equal(true);
          expect(res.body.status).to.equal('IN_PROGRESS');

          const expectedCurrentDrawer = {
            startedAt: cashDrawerStartEvent.createdAt,
            startedBy: cashDrawerStartEvent.employeeName,
            startingCashAmount: cashDrawerStartEvent.startingCashAmount,
            cashSales: 0,
            cashRefunds: 0,
            cashInOut: 0,
            cashInOutType: null,
            expectedInDrawer: cashDrawerStartEvent.startingCashAmount,
            cashDrawerStartEventId: cashDrawerStartEvent.id,
          }
          expect(res.body.currentDrawer).to.deep.equal(expectedCurrentDrawer);
          expect(res.body.startEvent.id).to.equal(cashDrawerStartEvent.id);
          expect(res.body.endEvent).to.equal(undefined);
      });

      it('should retrieve IN_PROGRESS status successfully when new start event exists after end event', async () => {
          const cashDrawerEndEvent = await factory.create('cashDrawerEndEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            createdAt: new Date('4-5-2022').toISOString(),
          });
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
            createdAt: new Date('4-6-2022').toISOString(),
          });
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`).set(
              'authtoken',
              token,
          );
          
          // verify 200 status
          res.should.have.status(200);

          // verify body values
          expect(res.body.success).to.equal(true);
          expect(res.body.status).to.equal('IN_PROGRESS');

          const expectedCurrentDrawer = {
            startedAt: cashDrawerStartEvent.createdAt,
            startedBy: cashDrawerStartEvent.employeeName,
            startingCashAmount: cashDrawerStartEvent.startingCashAmount,
            cashSales: 0,
            cashRefunds: 0,
            cashInOut: 0,
            cashInOutType: null,
            expectedInDrawer: cashDrawerStartEvent.startingCashAmount,
            cashDrawerStartEventId: cashDrawerStartEvent.id,
          }
          expect(res.body.currentDrawer).to.deep.equal(expectedCurrentDrawer);
          expect(res.body.startEvent.id).to.equal(cashDrawerStartEvent.id);
          expect(res.body.endEvent.id).to.equal(cashDrawerEndEvent.id);
      });

      it('should retrieve REQUIRES_START status successfully when end event processed', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
            createdAt: new Date('4-5-2022').toISOString(),
          });
          const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            netOrderTotal: 100,
          });
          const order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
          });
          await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            paymentToken: 'cash',
            paymentProcessor: 'cash',
            stripeClientSecret: 'cash',
            totalAmount: 100,
            appliedAmount: 100,
            createdAt: new Date('4-6-2022').toISOString(),
          });
          const cashDrawerEndEvent = await factory.create('cashDrawerEndEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            createdAt: new Date('4-7-2022').toISOString(),
          });
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`).set(
              'authtoken',
              token,
          );
          
          // verify 200 status
          res.should.have.status(200);

          // verify body values
          expect(res.body.success).to.equal(true);
          expect(res.body.status).to.equal('REQUIRES_START');

          const expectedCurrentDrawer = {
            startedAt: cashDrawerStartEvent.createdAt,
            startedBy: cashDrawerStartEvent.employeeName,
            startingCashAmount: cashDrawerStartEvent.startingCashAmount,
            cashSales: 10000,
            cashRefunds: 0,
            cashInOut: 0,
            cashInOutType: null,
            expectedInDrawer: Number(cashDrawerStartEvent.startingCashAmount + 10000),
            cashDrawerStartEventId: cashDrawerStartEvent.id,
          }
          expect(res.body.currentDrawer).to.deep.equal(expectedCurrentDrawer);
          expect(res.body.startEvent.id).to.equal(cashDrawerStartEvent.id);
          expect(res.body.endEvent.id).to.equal(cashDrawerEndEvent.id);
      });
  });

  describe('test API to get cash drawer history', () => {
      const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-drawer/history';

      it('should throw an error if token is not sent', async () => {
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}, {}).set('authtoken', '');
          res.should.have.status(401);
      });

      it('should return store not found error', async () => {
          const token = await getToken(0);
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}, {}).set('authtoken', token);
          res.should.have.status(403);
      });

      it('should retrieve an empty results array when no history exists', async () => {
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, { pageNumber: 1 }).set(
              'authtoken',
              token,
          );
          
          // verify 200 status and other values
          res.should.have.status(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.history).to.deep.equal({
            results: [],
            total: 0,
          });
      });

      it('should retrieve a list of all cashDrawerEndEvents', async () => {
          await factory.createMany(
            'cashDrawerEndEvent',
            5,
            {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            },
        );
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, { pageNumber: 1 }).set(
              'authtoken',
              token,
          );
          
          // verify 200 status and other values
          res.should.have.status(200);
          expect(res.body.success).to.equal(true);

          // verify results match
          const endEvents = await CashDrawerEndEvent.query()
            .where({
                storeId: store.id,
            })
            .orderBy('createdAt', 'desc')
            .page(1, 20);
          expect(res.body.history).to.deep.equal(endEvents);
      });
  });

  describe('test API to get an individual cash drawer history event', () => {
      const apiEndPoint = '/api/v1/employee-tab/cash-management/cash-drawer/history';

      it('should throw an error if token is not sent', async () => {
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}/100`, {}, {}).set('authtoken', '');
          res.should.have.status(401);
      });

      it('should return store not found error', async () => {
          const token = await getToken(0);
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}/100`, {}, {}).set('authtoken', token);
          res.should.have.status(403);
      });

      it('should retrieve a formatted object which represents an individual cash drawer series', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
            createdAt: new Date('4-5-2022').toISOString(),
          });
          const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            netOrderTotal: 100,
          });
          const order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
          });
          await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            paymentToken: 'cash',
            paymentProcessor: 'cash',
            stripeClientSecret: 'cash',
            totalAmount: 100,
            appliedAmount: 100,
            createdAt: new Date('4-6-2022').toISOString(),
          });
          const cashDrawerEndEvent = await factory.create('cashDrawerEndEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            createdAt: new Date('4-7-2022').toISOString(),
          });
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}/${cashDrawerEndEvent.id}`).set(
              'authtoken',
              token,
          );
          
          // verify 200 status and other values
          res.should.have.status(200);
          expect(res.body.success).to.equal(true);

          // verify that expected data is returned
          const expectedResult = {
            id: cashDrawerEndEvent.id,
            startedAt: cashDrawerStartEvent.createdAt,
            startedBy: cashDrawerStartEvent.employeeName,
            endedAt: cashDrawerEndEvent.createdAt,
            endedBy: cashDrawerEndEvent.employeeName,
            startingCashAmount: cashDrawerStartEvent.startingCashAmount,
            endingAmount: cashDrawerEndEvent.actualInDrawer,
            cashSales: cashDrawerEndEvent.cashSalesAmount,
            cashRefunds: cashDrawerEndEvent.cashRefundAmount,
            cashInOut: 0,
            cashInOutType: null,
            expectedInDrawer: cashDrawerEndEvent.expectedInDrawer,
            actualInDrawer: cashDrawerEndEvent.actualInDrawer,
            cashDrawerStartEventId: cashDrawerStartEvent.id,
          };
          expect(res.body.historicalEvent).to.deep.equal(expectedResult);
      });

      it('should retrieve a formatted object which represents an individual cash drawer series with cashOutEvent included', async () => {
          const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: startingAmount,
            createdAt: new Date('4-4-2022').toISOString(),
          });
          const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            netOrderTotal: 100,
          });
          const order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
          });
          await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            paymentToken: 'cash',
            paymentProcessor: 'cash',
            stripeClientSecret: 'cash',
            totalAmount: 100,
            appliedAmount: 100,
            createdAt: new Date('4-5-2022').toISOString(),
          });
          const cashOutEvent = await factory.create('cashOutEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            type: 'OUT',
            totalCashChanged: 500,
            createdAt: new Date('4-6-2022').toISOString(),
          })
          const cashDrawerEndEvent = await factory.create('cashDrawerEndEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            createdAt: new Date('4-7-2022').toISOString(),
          });
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}/${cashDrawerEndEvent.id}`).set(
              'authtoken',
              token,
          );
          
          // verify 200 status and other values
          res.should.have.status(200);
          expect(res.body.success).to.equal(true);

          // verify that expected data is returned
          const expectedResult = {
            id: cashDrawerEndEvent.id,
            startedAt: cashDrawerStartEvent.createdAt,
            startedBy: cashDrawerStartEvent.employeeName,
            endedAt: cashDrawerEndEvent.createdAt,
            endedBy: cashDrawerEndEvent.employeeName,
            startingCashAmount: cashDrawerStartEvent.startingCashAmount,
            endingAmount: cashDrawerEndEvent.actualInDrawer,
            cashSales: cashDrawerEndEvent.cashSalesAmount,
            cashRefunds: cashDrawerEndEvent.cashRefundAmount,
            cashInOut: cashOutEvent.totalCashChanged,
            cashInOutType: cashOutEvent.type,
            expectedInDrawer: cashDrawerEndEvent.expectedInDrawer,
            actualInDrawer: cashDrawerEndEvent.actualInDrawer,
            cashDrawerStartEventId: cashDrawerStartEvent.id,
          };
          expect(res.body.historicalEvent).to.deep.equal(expectedResult);
      });
  });
});

