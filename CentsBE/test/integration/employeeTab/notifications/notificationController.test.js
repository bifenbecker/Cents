const mockDate = require('mockdate');

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');

const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);

const { expect } = require('../../../support/chaiHelper');
const eventEmitter = require('../../../../config/eventEmitter');

describe('test notificationController APIs', () => {
    let business, store, centsCustomer, storeCustomer, serviceOrder, token, now;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        centsCustomer = await factory.create('centsCustomer');
        storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: business.id,
            phoneNumber: centsCustomer.phoneNumber,
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            email: centsCustomer.email,
        });
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        token = generateToken({ id: store.id });
        now = new Date('4-5-2022').toISOString();
        mockDate.set(now);
    });

    describe('test notificationController', () => {
        describe('test sendScheduledTextMessage', () => {
            const apiEndPoint = '/api/v1/employee-tab/notifications/scheduled';

            it('should throw an error if token is not sent', async () => {
                const res = await ChaiHttpRequestHelper.post(`${apiEndPoint}`, {}, {}).set(
                    'authtoken',
                    '',
                );
                res.should.have.status(401);
            });

            it('should return store not found error', async () => {
                const failedToken = generateToken({ id: 100 });
                const res = await ChaiHttpRequestHelper.post(`${apiEndPoint}`, {}, {}).set(
                    'authtoken',
                    failedToken,
                );
                res.should.have.status(403);
            });

            it('should successfully emit an SMS event', async () => {
                const spy = chai.spy(() => {});
                eventEmitter.once('orderSmsNotification', spy);

                const payload = {
                  phoneNumber: storeCustomer.phoneNumber,
                  dateScheduled: new Date('4-6-2022').toISOString(),
                  serviceOrderId: serviceOrder.id,
                  storeId: store.id,
                };
                const res = await ChaiHttpRequestHelper.post(
                    `${apiEndPoint}`,
                    {},
                    payload,
                ).set('authtoken', token);

                // verify 200 status and other values
                res.should.have.status(200);

                expect(spy).to.have.been.called.with(payload.serviceOrderId);
            });
        });
    });
});
