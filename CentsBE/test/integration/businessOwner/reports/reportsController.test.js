const sinon = require('sinon');
const moment = require('moment');
const momenttz = require('moment-timezone');
const { omit, map } = require('lodash');
const querystring = require('querystring');

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const UserRole = require('../../../../models/userRoles');
const User = require('../../../../models/user');
const StoreSettings = require('../../../../models/storeSettings');
const ServiceCategoryType = require('../../../../models/serviceCategoryType');
const BusinessCustomer = require('../../../../models/businessCustomer');

const eventEmitter = require('../../../../config/eventEmitter');
const {
    createCompletedServiceOrder,
    createCompletedServiceOrderWithItemsAndPayments,
} = require('../../../support/serviceOrderTestHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const {
    createServiceOrderWithLineItems,
    createInventoryOrderWithLineItems,
} = require('../../../support/serviceOrderTestHelper');
const {
    createCompletedInventoryOrderWithItemsAndPayments,
} = require('../../../support/inventoryOrderTestHelper');
const {
    serviceCategoryTypes,
    statuses,
    inventoryOrderStatuses,
    REPORT_TYPES,
} = require('../../../../constants/constants');
const store = require('../../../../queryHelpers/store');
const reportUtils = require('../../../../utils/reports/reportsUtils');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const storeTimeZone = 'America/Los_Angeles';
const userTimeZone = 'America/New_York';

function expectBaseSalesByServiceSubCategoryResponse(body) {
    expect(body.success).to.be.true;
    expect(body.sales).to.be.an('object');
    expect(body.sales.categories).to.be.an('array').of.length(3);

    expect(body.sales.categories[0]).to.be.an('object');
    expect(body.sales.categories[0]).to.have.property('name', 'Laundry');
    expect(body.sales.categories[0]).to.have.property('subcategories').that.is.an('array');

    expect(body.sales.categories[1]).to.be.an('object');
    expect(body.sales.categories[1]).to.have.property('name', 'Dry Cleaning');
    expect(body.sales.categories[1]).to.have.property('subcategories').that.is.an('array');

    expect(body.sales.categories[2]).to.be.an('object');
    expect(body.sales.categories[2]).to.have.property('name', 'Products');
    expect(body.sales.categories[2]).to.have.property('subcategories').that.is.an('array');
}

describe('test tip per order report API', () => {
    const ENDPOINT_URL = '/api/v1/business-owner/reports/stores/service-orders/tips';

    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is not present', async () => {
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should respond with a 403 when token is invalid', async () => {
            const token = await generateToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', token);
            res.should.have.status(403);
        });
    });

    describe('with auth token', () => {
        let token, user, params, business, teamMember, store, store2;

        beforeEach(async () => {
            user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                userId: user.id,
            });
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
                name: 'Avengers',
            });
            store2 = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
                name: 'Justice League',
            });
            await StoreSettings.query()
                .patch({
                    timeZone: 'America/Los_Angeles',
                })
                .whereIn('storeId', [store.id, store2.id]);

            params = {
                userId: user.id,
                stores: [store.id],
            };
            teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
                userId: user.id,
                businessId: business.id,
            });
            token = await generateToken({ id: user.id, teamMemberId: teamMember.id });

            storeOrderDetails = await createCompletedServiceOrder(store, {
                withActivityLogs: true,
                withPayment: true,
                serviceOrderFields: { orderCode: '1001' },
            });
            store2OrderDetails = await createCompletedServiceOrder(store2, {
                withActivityLogs: true,
                withPayment: true,
                serviceOrderFields: { orderCode: '1002' },
            });
        });

        describe('when allStoresCheck is true', () => {
            beforeEach(async () => {
                params = {
                    startDate: moment().subtract(1, 'w').format(),
                    endDate: moment().add(1, 'w').format(),
                    timeZone: 'America/Los_Angeles',
                    allStoresCheck: 'true',
                };
            });

            it('should return tips array', async () => {
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                    'authtoken',
                    token,
                );
                res.should.have.status(200);
                expect(res.body).to.have.property('tips');
            });

            it('should return orders from all stores', async () => {
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                    'authtoken',
                    token,
                );

                const { tips } = res.body;
                expect(tips).to.have.lengthOf(2);
                tips.forEach((tip) => {
                    [
                        'orderCode',
                        'name',
                        'netOrderTotal',
                        'tipAmount',
                        'customerName',
                        'paymentDate',
                        'intakeEmployee',
                        'washingEmployee',
                        'dryingEmployee',
                        'completeProcessingEmployee',
                        'completeEmployee',
                        'inTakePounds',
                    ].forEach((field) => {
                        expect(tip).to.have.property(field);
                    });
                });
                expect(tips[0].orderCode).to.equal('1001');
                expect(tips[1].orderCode).to.equal('1002');
            });
        });

        describe('when allStoresCheck is false', () => {
            beforeEach(async () => {
                params = {
                    startDate: moment().subtract(1, 'w').format(),
                    endDate: moment().add(1, 'w').format(),
                    timeZone: 'America/Los_Angeles',
                    'stores[]': store.id,
                };
            });

            it('should return tips array', async () => {
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params).set(
                    'authtoken',
                    token,
                );
                res.should.have.status(200);
                expect(res.body).to.have.property('tips');
            });

            it('should return orders from given stores', async () => {
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params).set(
                    'authtoken',
                    token,
                );

                const { tips } = res.body;
                expect(tips).to.have.lengthOf(1);
                tips.forEach((tip) => {
                    [
                        'orderCode',
                        'name',
                        'netOrderTotal',
                        'tipAmount',
                        'customerName',
                        'paymentDate',
                        'intakeEmployee',
                        'washingEmployee',
                        'dryingEmployee',
                        'completeProcessingEmployee',
                        'completeEmployee',
                        'inTakePounds',
                    ].forEach((field) => {
                        expect(tip).to.have.property(field);
                    });
                });
                expect(tips[0].orderCode).to.equal('1001');
            });

            it('should have proper values', async () => {
                await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                    serviceOrderId: storeOrderDetails.serviceOrder.id,
                    step: 1,
                    totalWeight: 5,
                    chargeableWeight: 5,
                });

                await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                    serviceOrderId: storeOrderDetails.serviceOrder.id,
                    step: 2,
                    totalWeight: 50,
                    chargeableWeight: 50,
                });
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params).set(
                    'authtoken',
                    token,
                );

                const { tips } = res.body;
                const [tip] = tips;

                expect(tips).to.have.lengthOf(1);
                expect(tip.orderCode).to.equal('1001');
                expect(tip.name).to.equal(store.name);
                expect(tip.netOrderTotal).to.equal(storeOrderDetails.serviceOrder.netOrderTotal);
                expect(tip.tipAmount).to.equal(storeOrderDetails.serviceOrder.tipAmount);
                expect(tip.customerName).to.equal(
                    `${storeOrderDetails.storeCustomer.firstName} ${storeOrderDetails.storeCustomer.lastName}`,
                );
                expect(tip.intakeEmployee).to.equal(
                    storeOrderDetails.activityLogs.intake.employeeName,
                );
                expect(tip.washingEmployee).to.equal(
                    storeOrderDetails.activityLogs.washing.employeeName,
                );
                // Since drying and washing employees are the same.
                expect(tip.dryingEmployee).to.equal(
                    storeOrderDetails.activityLogs.washing.employeeName,
                );
                expect(tip.completeProcessingEmployee).to.equal(
                    storeOrderDetails.activityLogs.completeProcessing.employeeName,
                );
                expect(tip.completeEmployee).to.equal(
                    storeOrderDetails.activityLogs.completeOrPickup.employeeName,
                );
                expect(tip.inTakePounds).to.equal(15);
            });
        });
    });
});

describe('test subscriptions list report api', () => {
    const ENDPOINT_URL = '/api/v1/business-owner/reports/subscriptions';

    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is not present', async () => {
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should respond with a 403 when token is invalid', async () => {
            const token = await generateToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', token);
            res.should.have.status(403);
        });
    });

    describe('with auth token', () => {
        let token;
        let user;
        let params;
        let business;
        let teamMember;
        let store;
        let store2;
        let spy;

        beforeEach(async () => {
            spy = sinon.spy();
            eventEmitter.on('downloadReport', spy);
            user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                userId: user.id,
            });
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            store2 = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
            await StoreSettings.query()
                .patch({
                    timeZone: 'America/Los_Angeles',
                })
                .whereIn('storeId', [store.id, store2.id]);

            params = {
                userId: user.id,
                stores: [store.id],
            };
            teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
                userId: user.id,
                businessId: business.id,
            });
            token = await generateToken({ id: user.id, teamMemberId: teamMember.id });
        });

        describe('validate query params', () => {
            beforeEach(async () => {
                params.allStoresCheck = 'true';
            });

            it('should respond with 422 when userId is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, 'userId'),
                ).set('authtoken', token);
                res.should.have.status(422);
                expect(JSON.parse(res.text).error).to.include('userId is required');
            });

            it('should respond with 422 when allStoresCheck is false and stores is missing', async () => {
                params.allStoresCheck = 'false';
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, 'stores'),
                ).set('authtoken', token);
                res.should.have.status(422);
                expect(JSON.parse(res.text).error).to.include('stores is required');
            });

            it('should respond with 200 when required params are present', async () => {
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params).set(
                    'authtoken',
                    token,
                );
                res.should.have.status(200);
            });
        });

        describe('when allStoresCheck is true', () => {
            let expected, recipient;
            beforeEach(async () => {
                params = {
                    allStoresCheck: 'true',
                    userId: user.id,
                };
                recipient = await User.query().findById(user.id);
                expected = {
                    options: {
                        stores: [store.id, store2.id],
                        storeCount: 2,
                    },
                    recipient,
                    reportType: REPORT_TYPES.subscriptionsReport,
                };
            });
            describe('when business owner', () => {
                it('fetch data from all stores', async () => {
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params).set(
                        'authtoken',
                        token,
                    );
                    res.should.have.status(200);
                    sinon.assert.calledOnce(spy);
                });
            });
            describe('when business manager', () => {
                it('fetch data from assigned stores', async () => {
                    // delete business owner role
                    await UserRole.query().delete().where('userId', user.id);

                    // create business manager role
                    await factory.create(FACTORIES_NAMES.userRole, {
                        userId: user.id,
                        roleId: factory.assoc(FACTORIES_NAMES.role, 'id', {
                            userType: 'Business Manager',
                        }),
                    });
                    await factory.create(FACTORIES_NAMES.teamMemberStore, {
                        teamMemberId: teamMember.id,
                        storeId: store.id,
                    });
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params).set(
                        'authtoken',
                        token,
                    );
                    expected.options.stores = [store.id];
                    expected.options.storeCount = 1;
                    res.should.have.status(200);
                    sinon.assert.calledOnce(spy);
                    sinon.assert.calledWith(spy, expected);
                });
            });
        });
    });
});

describe('tests deliveries report api', () => {
    const ENDPOINT_URL = '/api/v1/business-owner/reports/stores/deliveries';
    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is not present', async () => {
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should respond with a 403 when token is invalid', async () => {
            const token = await generateToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', token);
            res.should.have.status(403);
        });
    });

    describe('with auth token', () => {
        let token, user, params, business, teamMember, store, store2, spy;

        beforeEach(async () => {
            spy = sinon.spy();
            eventEmitter.on('downloadReport', spy);
            user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                userId: user.id,
            });
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            store2 = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
            await StoreSettings.query()
                .patch({
                    timeZone: 'America/Los_Angeles',
                })
                .whereIn('storeId', [store.id, store2.id]);

            params = {
                startDate: '2022-05-09T12:59:32.582Z',
                endDate: '2022-05-11T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                userId: user.id,
                stores: [store.id],
            };
            teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
                userId: user.id,
                businessId: business.id,
            });
            token = await generateToken({ id: user.id, teamMemberId: teamMember.id });
        });

        describe('validate query params', () => {
            beforeEach(async () => {
                params.allStoresCheck = 'true';
            });
            it('should respond with 422 when startDate is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, 'startDate'),
                ).set('authtoken', token);
                res.should.have.status(422);
                expect(JSON.parse(res.text).error).to.include('"startDate" is required');
            });
            it('should respond with 422 when endDate is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, 'endDate'),
                ).set('authtoken', token);
                res.should.have.status(422);
                expect(JSON.parse(res.text).error).to.include('"endDate" is required');
            });
            it('should respond with 422 when timeZone is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, 'timeZone'),
                ).set('authtoken', token);
                res.should.have.status(422);
                expect(JSON.parse(res.text).error).to.include('"timeZone" is required');
            });

            it('should respond with 422 when userId is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, 'userId'),
                ).set('authtoken', token);
                res.should.have.status(422);
                expect(JSON.parse(res.text).error).to.include('"userId" is required');
            });

            it('should respond with 422 when allStoresCheck is false and stores is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, ['allStoresCheck', 'stores']),
                ).set('authtoken', token);
                res.should.have.status(422);
                expect(JSON.parse(res.text).error).to.include('"stores" is required');
            });

            it('should respond with 200 when required params are present', async () => {
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, {
                    ...params,
                    stores: [store.id],
                }).set('authtoken', token);
                res.should.have.status(200);
            });
        });

        describe('when allStoresCheck is true', () => {
            let expected, receipt;
            beforeEach(async () => {
                params = {
                    startDate: '2022-05-09T12:59:32.582Z',
                    endDate: '2022-05-11T12:59:32.582Z',
                    timeZone: 'America/Los_Angeles',
                    allStoresCheck: 'true',
                    userId: user.id,
                };
                recipient = await User.query().findById(user.id);
                expected = {
                    options: {
                        startDate: '05-09-2022 00:00:00',
                        endDate: '05-11-2022 23:59:59',
                        storeIds: [store.id, store2.id],
                        ownDriver: false,
                        doordash: false,
                        timeZone: 'America/Los_Angeles',
                        storeCount: 2,
                    },
                    recipient: recipient,
                    reportType: REPORT_TYPES.deliveriesReport,
                };
            });
            describe('when business owner', () => {
                it('fetch data from all stores', async () => {
                    const formattedParams = querystring.stringify(params);
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                        'authtoken',
                        token,
                    );

                    res.should.have.status(200);
                    sinon.assert.calledOnce(spy);
                    expect(spy.lastCall.args[0].options.storeIds.includes(store.id)).to.be.true;
                    expect(spy.lastCall.args[0].options.storeIds.includes(store2.id)).to.be.true;
                    expect(spy.lastCall.args[0].options.startDate).to.equal('05-09-2022 00:00:00');
                    expect(spy.lastCall.args[0].options.endDate).to.equal('05-11-2022 23:59:59');
                    expect(spy.lastCall.args[0].options.ownDriver).to.be.false;
                    expect(spy.lastCall.args[0].options.doordash).to.be.false;
                    expect(spy.lastCall.args[0].options.timeZone).to.equal('America/Los_Angeles');
                    expect(spy.lastCall.args[0].options.storeCount).to.equal(2);
                    expect(spy.lastCall.args[0].recipient.id).to.equal(recipient.id);
                    expect(spy.lastCall.args[0].reportType).to.equal(REPORT_TYPES.deliveriesReport);
                });
            });
            describe('when business manager', () => {
                it('fetch data from assigned stores', async () => {
                    // delete business owner role
                    await UserRole.query().delete().where('userId', user.id);

                    // create business manager role
                    await factory.create(FACTORIES_NAMES.userRole, {
                        userId: user.id,
                        roleId: factory.assoc(FACTORIES_NAMES.role, 'id', {
                            userType: 'Business Manager',
                        }),
                    });
                    await factory.create(FACTORIES_NAMES.teamMemberStore, {
                        teamMemberId: teamMember.id,
                        storeId: store.id,
                    });
                    const formattedParams = querystring.stringify(params);
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                        'authtoken',
                        token,
                    );
                    expected.options.storeIds = [store.id];
                    expected.options.storeCount = 1;
                    res.should.have.status(200);
                    sinon.assert.calledOnce(spy);
                    sinon.assert.calledWith(spy, expected);
                });
            });
        });

        describe('with OWN_DRIVER as delivery provider', () => {
            beforeEach(async () => {
                params = {
                    ...params,
                    deliveryProvider: 'OWN_DRIVER',
                };
            });
            it('fetch only standard deliveries', async () => {
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, {
                    ...params,
                    allStoresCheck: true,
                }).set('authtoken', token);
                const recipient = await User.query().findById(user.id);

                sinon.assert.calledOnce(spy);
                res.should.have.status(200);
                expect(spy.lastCall.args[0].options.storeIds.includes(store.id)).to.be.true;
                expect(spy.lastCall.args[0].options.storeIds.includes(store2.id)).to.be.true;
                expect(spy.lastCall.args[0].options.startDate).to.equal('05-09-2022 00:00:00');
                expect(spy.lastCall.args[0].options.endDate).to.equal('05-11-2022 23:59:59');
                expect(spy.lastCall.args[0].options.ownDriver).to.be.true;
                expect(spy.lastCall.args[0].options.doordash).to.be.false;
                expect(spy.lastCall.args[0].options.timeZone).to.equal('America/Los_Angeles');
                expect(spy.lastCall.args[0].options.storeCount).to.equal(2);
                expect(spy.lastCall.args[0].recipient.id).to.equal(recipient.id);
                expect(spy.lastCall.args[0].reportType).to.equal(REPORT_TYPES.deliveriesReport);
            });
        });

        describe('with DOORDASH as delivery provider', () => {
            beforeEach(async () => {
                params = {
                    ...params,
                    allStoresCheck: true,
                    deliveryProvider: 'DOORDASH',
                };
            });
            it('fetch only ondemand deliveries', async () => {
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                    'authtoken',
                    token,
                );
                const recipient = await User.query().findById(user.id);

                sinon.assert.calledOnce(spy);
                res.should.have.status(200);
                expect(spy.lastCall.args[0].options.storeIds.includes(store.id)).to.be.true;
                expect(spy.lastCall.args[0].options.storeIds.includes(store2.id)).to.be.true;
                expect(spy.lastCall.args[0].options.startDate).to.equal('05-09-2022 00:00:00');
                expect(spy.lastCall.args[0].options.endDate).to.equal('05-11-2022 23:59:59');
                expect(spy.lastCall.args[0].options.ownDriver).to.be.false;
                expect(spy.lastCall.args[0].options.doordash).to.be.true;
                expect(spy.lastCall.args[0].options.timeZone).to.equal('America/Los_Angeles');
                expect(spy.lastCall.args[0].options.storeCount).to.equal(2);
                expect(spy.lastCall.args[0].recipient.id).to.equal(recipient.id);
                expect(spy.lastCall.args[0].reportType).to.equal(REPORT_TYPES.deliveriesReport);
            });
        });

        describe('when selecting future dates', () => {
            let futureDateString = moment()
                .add(4, 'days')
                .endOf('day')
                .format('MM-DD-YYYY HH:mm:ss');
            let currentDayString = moment().startOf('day').format('MM-DD-YYYY HH:mm:ss');
            beforeEach(async () => {
                params.endDate = futureDateString;
                params.allStoresCheck = true;
            });

            it('should call getSubscriptionFutureDates function to return futureStartDate and futureEndDate', async () => {
                const getSubscriptionFutureDatesStub = sinon.stub(
                    reportUtils,
                    'getSubscriptionFutureDates',
                );
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                    'authtoken',
                    token,
                );
                sinon.assert.calledOnce(getSubscriptionFutureDatesStub);
            });
            it('includes futureStartDate and futureEndDate in options', async () => {
                const getSubscriptionFutureDatesStub = sinon
                    .stub(reportUtils, 'getSubscriptionFutureDates')
                    .returns([currentDayString, futureDateString]);
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                    'authtoken',
                    token,
                );
                const recipient = await User.query().findById(user.id);

                sinon.assert.calledOnce(getSubscriptionFutureDatesStub);

                sinon.assert.calledOnce(spy);
                res.should.have.status(200);
                expect(spy.lastCall.args[0].options.storeIds.includes(store.id)).to.be.true;
                expect(spy.lastCall.args[0].options.storeIds.includes(store2.id)).to.be.true;
                expect(spy.lastCall.args[0].options.startDate).to.equal('05-09-2022 00:00:00');
                expect(spy.lastCall.args[0].options.endDate).to.equal(futureDateString);
                expect(spy.lastCall.args[0].options.futureStartDate).to.equal(currentDayString);
                expect(spy.lastCall.args[0].options.futureEndDate).to.equal(futureDateString);
                expect(spy.lastCall.args[0].options.ownDriver).to.be.false;
                expect(spy.lastCall.args[0].options.doordash).to.be.false;
                expect(spy.lastCall.args[0].options.timeZone).to.equal('America/Los_Angeles');
                expect(spy.lastCall.args[0].options.storeCount).to.equal(2);
                expect(spy.lastCall.args[0].recipient.id).to.equal(recipient.id);
                expect(spy.lastCall.args[0].reportType).to.equal(REPORT_TYPES.deliveriesReport);
            });
        });
    });
});

describe('tests get revenue by paymentMethod api', () => {
    const ENDPOINT_URL = '/api/v1/business-owner/reports/stores/revenue/payment-methods';
    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is not present', async () => {
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should respond with a 403 when token is invalid', async () => {
            const token = await generateToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', token);
            res.should.have.status(403);
        });
    });

    describe('with auth token', () => {
        let token, user, params, business, teamMember, store, store2;

        beforeEach(async () => {
            user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                userId: user.id,
            });
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            store2 = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
            await StoreSettings.query()
                .patch({
                    timeZone: 'America/Los_Angeles',
                })
                .whereIn('storeId', [store.id, store2.id]);

            params = {
                startDate: '2022-05-09T12:59:32.582Z',
                endDate: '2022-05-11T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                userId: user.id,
                stores: [store.id],
                allStoresCheck: 'true',
            };
            teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
                userId: user.id,
                businessId: business.id,
            });
            token = await generateToken({ id: user.id, teamMemberId: teamMember.id });
        });

        describe('retrieve payments for all stores', () => {
            beforeEach(async () => {
                params = {
                    startDate: '2022-05-09T12:59:32.582Z',
                    endDate: '2022-05-11T12:59:32.582Z',
                    timeZone: 'America/Los_Angeles',
                    allStoresCheck: 'true',
                };
            });

            it('fetch payments from all stores', async () => {
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                    'authtoken',
                    token,
                );

                res.should.have.status(200);
                expect(res.body).to.have.property('revenue').that.is.an('array');
            });
        });

        describe('retrieve payments for specified stores', () => {
            beforeEach(async () => {
                params = {
                    startDate: '2022-05-09T12:59:32.582Z',
                    endDate: '2022-05-11T12:59:32.582Z',
                    timeZone: 'America/Los_Angeles',
                    allStoresCheck: 'false',
                    stores: [store.id, store2.id]
                };

                const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
                const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                    storeId: store.id,
                    businessId: store.businessId,
                    centsCustomerId: centsCustomer.id,
                });
                const serviceOrder =  await factory.create(FACTORIES_NAMES.serviceOrder, {
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                });
                const order = await factory.create(FACTORIES_NAMES.serviceOrderMasterOrder, {
                    orderableId: serviceOrder.id,
                });
                await factory.create(FACTORIES_NAMES.payment, {
                    storeId: store.id,
                    orderId: order.id,
                    paymentProcessor: 'cash',
                    createdAt: '2022-05-10T12:59:32.582Z',
                    appliedAmount: 20.2,
                    status: 'succeeded'
                });
            });

            it('fetch payments from stores', async () => {
                const formattedParams = querystring.stringify(params);
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, formattedParams).set(
                    'authtoken',
                    token,
                );

                res.should.have.status(200);
                expect(res.body).to.have.property('revenue').that.is.an('array');
                expect(map(res.body.revenue,'storeId')).to.have.members([store.id]);
            });
        });
    });
});

const getLineItemTotalCostSum = (items, type, isInventory) => {
    return items.reduce(function (tot, arr) {
        if (type === arr.category || isInventory) return tot + arr.lineItemTotalCost;
        else return tot;
    }, 0);
};

describe('tests sales by service category report api', () => {
    const ENDPOINT_URL = '/api/v1/business-owner/reports/categories/sales';

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => ENDPOINT_URL);

    describe('with auth token', () => {
        let token, user, params, business, teamMember, store, store2;

        beforeEach(async () => {
            user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                userId: user.id,
            });
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            store2 = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
            await StoreSettings.query()
                .patch({
                    timeZone: 'America/Los_Angeles',
                })
                .whereIn('storeId', [store.id, store2.id]);

            params = {
                startDate: moment().tz('America/Los_Angeles').format(),
                endDate: moment().tz('America/Los_Angeles').add('6', 'd').format(),
                timeZone: 'America/Los_Angeles',
                status: 'COMPLETED_AND_ACTIVE',
                stores: [store.id, store2.id],
            };
            teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
                userId: user.id,
                businessId: business.id,
            });
            token = await generateToken({ id: user.id, teamMemberId: teamMember.id });
        });

        describe('with completed orders as status param', () => {
            let completedServiceOrder, completedInventoryOrder;
            beforeEach(async () => {
                params.status = 'COMPLETED';
                completedServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'COMPLETED',
                    },
                    {
                        lineItemTotalCost: 2,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                await createServiceOrderWithLineItems(
                    {
                        storeId: store2.id,
                        status: 'CANCELLED',
                    },

                    {
                        lineItemTotalCost: 1,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                completedInventoryOrder = await createInventoryOrderWithLineItems(
                    {
                        storeId: store.id,
                        netOrderTotal: 0,
                    },
                    {
                        lineItemTotalCost: 20,
                    },
                );
            });
            it('fetch only Compeleted orders sales', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });
                const { sales } = body;
                const expectedPerPoundSales = getLineItemTotalCostSum(
                    [completedServiceOrder],
                    'PER_POUND',
                    false,
                );
                const expectedFixedPriceSales = getLineItemTotalCostSum(
                    [completedServiceOrder],
                    'FIXED_PRICE',
                    false,
                );
                const expectedTotalProductSales = getLineItemTotalCostSum(
                    [completedInventoryOrder],
                    'INVENTORY',
                    true,
                );
                const expectedTotalSales =
                    expectedPerPoundSales + expectedFixedPriceSales + expectedTotalProductSales;
                expect(sales.perPoundSales).to.equal(expectedPerPoundSales);
                expect(sales.totalProductSales).to.equal(expectedTotalProductSales);
                expect(sales.totalSales).to.equal(expectedTotalSales);
            });
        });

        describe('with active orders as status param', () => {
            let activeServiceOrder, activeInventoryOrder;

            beforeEach(async () => {
                params.status = 'ACTIVE';
                activeServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 5,
                        category: 'FIXED_PRICE',
                    },
                    business.id,
                );
                await createServiceOrderWithLineItems(
                    {
                        storeId: store2.id,
                        status: 'COMPLETED',
                    },

                    {
                        lineItemTotalCost: 1,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                activeInventoryOrder = await createInventoryOrderWithLineItems(
                    {
                        storeId: store.id,
                        netOrderTotal: 1,
                    },
                    {
                        lineItemTotalCost: 5,
                    },
                );
            });
            it('fetch only Active orders sales', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });
                const { sales } = body;
                const expectedPerPoundSales = getLineItemTotalCostSum(
                    [activeServiceOrder],
                    'PER_POUND',
                    false,
                );
                const expectedFixedPriceSales = getLineItemTotalCostSum(
                    [activeServiceOrder],
                    'FIXED_PRICE',
                    false,
                );
                const expectedTotalProductSales = getLineItemTotalCostSum(
                    [activeInventoryOrder],
                    'INVENTORY',
                    true,
                );
                const expectedTotalSales =
                    expectedPerPoundSales + expectedFixedPriceSales + expectedTotalProductSales;
                expect(sales.totalSales).to.equal(expectedTotalSales);
            });
        });

        describe('with active and completed orders as status param', () => {
            let activeServiceOrder, completedServiceOrder, activeInventoryOrder;

            beforeEach(async () => {
                params.status = 'COMPLETED_AND_ACTIVE';

                activeServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 5,
                        category: 'FIXED_PRICE',
                    },
                    business.id,
                );
                completedServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store2.id,
                        status: 'COMPLETED',
                    },

                    {
                        lineItemTotalCost: 1,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                activeInventoryOrder = await createInventoryOrderWithLineItems(
                    {
                        storeId: store.id,
                        netOrderTotal: 1,
                    },
                    {
                        lineItemTotalCost: 5,
                    },
                );
            });
            it('fetch both Completed and Active orders sales', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });

                const { sales } = body;
                const expectedPerPoundSales = getLineItemTotalCostSum(
                    [activeServiceOrder, completedServiceOrder],
                    'PER_POUND',
                    false,
                );
                const expectedFixedPriceSales = getLineItemTotalCostSum(
                    [activeServiceOrder, completedServiceOrder],
                    'FIXED_PRICE',
                    false,
                );
                const expectedTotalProductSales = getLineItemTotalCostSum(
                    [activeInventoryOrder],
                    'INVENTORY',
                    true,
                );
                const expectedTotalSales =
                    expectedPerPoundSales + expectedFixedPriceSales + expectedTotalProductSales;
                expect(sales.totalSales).to.equal(expectedTotalSales);
            });
        });

        describe('Verify perpound sales info', () => {
            let completedServiceOrder,
                activeServiceOrder,
                activeServiceOrder2,
                completedServiceOrder2;

            beforeEach(async () => {
                params.status = 'COMPLETED_AND_ACTIVE';
                completedServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store2.id,
                        status: 'COMPLETED',
                    },

                    {
                        lineItemTotalCost: 20,
                        category: 'FIXED_PRICE',
                    },
                    business.id,
                );

                activeServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 5,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                activeServiceOrder2 = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 15,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                completedServiceOrder2 = await createServiceOrderWithLineItems(
                    {
                        storeId: store2.id,
                        status: 'COMPLETED',
                    },

                    {
                        lineItemTotalCost: 20,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
            });

            it('should return perpound sales', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });
                const { sales } = body;
                const expectedPerPoundSales = getLineItemTotalCostSum(
                    [
                        completedServiceOrder,
                        activeServiceOrder,
                        activeServiceOrder2,
                        completedServiceOrder2,
                    ],
                    'PER_POUND',
                    false,
                );
                expect(sales.perPoundSales).to.equal(expectedPerPoundSales);
            });
        });

        describe('Verify fixed price sales info', () => {
            let completedServiceOrder, activeServiceOrder, activeServiceOrder2, activeServiceOrder3;

            beforeEach(async () => {
                params.status = 'COMPLETED_AND_ACTIVE';
                activeServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 15,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                activeServiceOrder2 = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 5,
                        category: 'FIXED_PRICE',
                    },
                    business.id,
                );
                activeServiceOrder3 = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 15,
                        category: 'FIXED_PRICE',
                    },
                    business.id,
                );
                completedServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store2.id,
                        status: 'COMPLETED',
                    },

                    {
                        lineItemTotalCost: 20,
                        category: 'FIXED_PRICE',
                    },
                    business.id,
                );
            });

            it('should return fixed price sales', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });

                const { sales } = body;
                const expectedFixedPriceSales = getLineItemTotalCostSum(
                    [
                        completedServiceOrder,
                        activeServiceOrder,
                        activeServiceOrder2,
                        activeServiceOrder3,
                    ],
                    'FIXED_PRICE',
                    false,
                );

                expect(sales.fixedPriceSales).to.equal(expectedFixedPriceSales);
            });
        });

        describe('Verify product sales info with both service and inventory orders', () => {
            let activeInventoryOrder, activeInventoryOrder2, activeServiceOrder;

            beforeEach(async () => {
                params.status = 'COMPLETED_AND_ACTIVE';

                activeInventoryOrder = await createInventoryOrderWithLineItems(
                    {
                        storeId: store.id,
                        netOrderTotal: 1,
                    },
                    {
                        lineItemTotalCost: 5,
                    },
                );

                activeInventoryOrder2 = await createInventoryOrderWithLineItems(
                    {
                        storeId: store.id,
                        netOrderTotal: 1,
                    },
                    {
                        lineItemTotalCost: 1,
                    },
                );
                activeServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 5,
                        soldItemType: 'InventoryItem',
                    },
                    business.id,
                );
            });

            it('should return product sales', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });

                const { sales } = body;
                const expectedTotalProductSales = getLineItemTotalCostSum(
                    [activeInventoryOrder, activeInventoryOrder2, activeServiceOrder],
                    'INVENTORY',
                    true,
                );

                expect(sales.totalProductSales).to.equal(expectedTotalProductSales);
            });
        });

        describe('Verify product sales with only service orders', () => {
            let activeServiceOrder, activeServiceOrder2;

            beforeEach(async () => {
                params.status = 'COMPLETED_AND_ACTIVE';

                activeServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 5,
                        soldItemType: 'InventoryItem',
                    },
                    business.id,
                );
                activeServiceOrder2 = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                    },
                    {
                        lineItemTotalCost: 15,
                        soldItemType: 'InventoryItem',
                    },
                    business.id,
                );
            });

            it('should return product sales in service orders as well', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });

                const { sales } = body;
                const expectedTotalProductSales = getLineItemTotalCostSum(
                    [activeServiceOrder, activeServiceOrder2],
                    'INVENTORY',
                    true,
                );

                expect(sales.totalProductSales).to.equal(expectedTotalProductSales);
            });
        });

        describe('Verify product sales with only inventory orders', () => {
            let activeInventoryOrder, activeInventoryOrder2;

            beforeEach(async () => {
                params.status = 'COMPLETED_AND_ACTIVE';

                activeInventoryOrder = await createInventoryOrderWithLineItems(
                    {
                        storeId: store.id,
                        netOrderTotal: 1,
                    },
                    {
                        lineItemTotalCost: 10,
                    },
                );
                activeInventoryOrder2 = await createInventoryOrderWithLineItems(
                    {
                        storeId: store.id,
                        netOrderTotal: 1,
                    },
                    {
                        lineItemTotalCost: 5,
                    },
                );
            });

            it('should return product sales related to inventory orders', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });

                const { sales } = body;
                const expectedTotalProductSales = getLineItemTotalCostSum(
                    [activeInventoryOrder, activeInventoryOrder2],
                    'INVENTORY',
                    true,
                );
                expect(sales.totalProductSales).to.equal(expectedTotalProductSales);
            });
        });

        describe('Verify whether we are getting sales info from the given date range', () => {
            let activeServiceOrder, activeServiceOrder2;

            beforeEach(async () => {
                params.status = 'COMPLETED_AND_ACTIVE';
                activeServiceOrder = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                        placedAt: '2022-06-10T12:59:32.582Z',
                    },
                    {
                        lineItemTotalCost: 15,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
                activeServiceOrder2 = await createServiceOrderWithLineItems(
                    {
                        storeId: store.id,
                        status: 'PROCESSSING',
                        placedAt: '2022-06-13T12:59:32.582Z',
                    },
                    {
                        lineItemTotalCost: 15,
                        category: 'PER_POUND',
                    },
                    business.id,
                );
            });

            it('should return sales info related to given timeline', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: ENDPOINT_URL,
                    params,
                    token,
                });

                const { sales } = body;
                const expectedPerPoundSales = 0;
                const expectedFixedPriceSales = 0;
                const expectedTotalProductSales = 0;
                const expectedTotalSales =
                    expectedPerPoundSales + expectedFixedPriceSales + expectedTotalProductSales;
                expect(sales.totalSales).to.equal(expectedTotalSales);
            });
        });
    });
});

describe('test sales by service subcategory report api', () => {
    const apiEndpoint = '/api/v1/business-owner/reports/categories/sales/by-subcategory';
    let token,
        startDate,
        endDate,
        storesIds,
        serviceCategoriesLaundry,
        serviceCategoriesDryCleaning,
        inventoryCategories,
        serviceOrder1_LineDetail1,
        serviceOrder2_LineDetail1,
        serviceOrder2_LineDetail2,
        serviceOrder2_LineDetail3,
        serviceOrder3_LineDetail1,
        serviceOrder3_LineDetail2,
        serviceOrder3_LineDetail3,
        serviceOrder4_LineDetail1,
        serviceOrder4_LineDetail2,
        inventoryOrder1_Item1,
        inventoryOrder1_Item2,
        inventoryOrder2_Item1,
        inventoryOrder2_Item2;

    beforeEach(async () => {
        startDate = moment().format();
        endDate = moment().add(1, 'w').format();
        serviceCategoriesLaundry = [];
        serviceCategoriesDryCleaning = [];
        inventoryCategories = [];

        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        const stores = await factory.createMany(FACTORIES_NAMES.store, 2, {
            businessId: business.id,
        });
        storesIds = stores.map((store) => store.id);
        await StoreSettings.query()
            .patch({
                timeZone: 'America/New_York',
            })
            .whereIn('storeId', storesIds);

        token = generateToken({
            id: user.id,
        });

        // Create service categories types
        const laundryCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType, {
            type: serviceCategoryTypes.LAUNDRY,
        });
        const dryCleaningCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType, {
            type: serviceCategoryTypes.DRY_CLEANING,
        });

        // Create service categories
        // Laundry
        serviceCategoriesLaundry[0] = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: laundryCategoryType.id,
            category: 'Hand Laundry',
        });
        serviceCategoriesLaundry[1] = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: laundryCategoryType.id,
            category: 'Wash & Fold',
        });
        // deleted laundry service category
        await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: laundryCategoryType.id,
            category: 'Soft Laundry',
            deletedAt: new Date(),
        });
        // delivery category
        await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: laundryCategoryType.id,
            category: 'DELIVERY',
        });
        // Dry Cleaning
        serviceCategoriesDryCleaning[0] = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: dryCleaningCategoryType.id,
            category: 'Auto Dry Cleaning',
        });
        serviceCategoriesDryCleaning[1] = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: dryCleaningCategoryType.id,
            category: 'Dry Cleaning',
        });
        // deleted dry-cleaning service category
        await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: dryCleaningCategoryType.id,
            category: 'Soft Dry Cleaning',
            deletedAt: new Date(),
        });

        // Create inventory categories
        inventoryCategories[0] = await factory.create(FACTORIES_NAMES.inventoryCategory, {
            businessId: business.id,
            name: 'Bags',
        });
        inventoryCategories[1] = await factory.create(FACTORIES_NAMES.inventoryCategory, {
            businessId: business.id,
            name: 'Snacks',
        });
        // deleted category
        await factory.create(FACTORIES_NAMES.inventoryCategory, {
            businessId: business.id,
            name: 'Powders',
            deletedAt: new Date(),
        });

        // Create orders
        // Service orders
        // One item - one payment
        [serviceOrder1_LineDetail1] = await createCompletedServiceOrderWithItemsAndPayments(
            storesIds[0],
            [
                {
                    lineItemTotalCost: 10,
                    serviceCategoryType: serviceCategoryTypes.LAUNDRY,
                    category: serviceCategoriesLaundry[0].category,
                },
            ],
            [
                {
                    paymentProcessor: 'cash',
                    totalAmount: 10,
                },
            ],
        );
        // Three items - one payment
        [serviceOrder2_LineDetail1, serviceOrder2_LineDetail2, serviceOrder2_LineDetail3] =
            await createCompletedServiceOrderWithItemsAndPayments(
                storesIds[1],
                [
                    {
                        lineItemTotalCost: 7,
                        serviceCategoryType: serviceCategoryTypes.LAUNDRY,
                        category: serviceCategoriesLaundry[1].category,
                    },
                    {
                        lineItemTotalCost: 1,
                        serviceCategoryType: serviceCategoryTypes.DRY_CLEANING,
                        category: serviceCategoriesDryCleaning[0].category,
                    },
                    {
                        isInventoryItem: true,
                        lineItemTotalCost: 2.5,
                        category: inventoryCategories[0].name,
                    },
                ],
                [
                    {
                        paymentProcessor: 'stripe',
                        totalAmount: 19.5,
                    },
                ],
            );

        const now = new Date(),
            oneSecondLater = new Date(now.getTime() + 1000);

        // Three items - two payments (adjusted order)
        [serviceOrder3_LineDetail1, serviceOrder3_LineDetail2, serviceOrder3_LineDetail3] =
            await createCompletedServiceOrderWithItemsAndPayments(
                storesIds[0],
                [
                    {
                        lineItemTotalCost: 10.25,
                        serviceCategoryType: serviceCategoryTypes.LAUNDRY,
                        category: serviceCategoriesLaundry[0].category,
                        createdAt: now,
                    },
                    {
                        lineItemTotalCost: 1.99,
                        serviceCategoryType: serviceCategoryTypes.DRY_CLEANING,
                        category: serviceCategoriesDryCleaning[1].category,
                        createdAt: now,
                    },
                    {
                        isInventoryItem: true,
                        lineItemTotalCost: 2.5,
                        category: inventoryCategories[1].name,
                        createdAt: oneSecondLater,
                    },
                ],
                [
                    {
                        paymentProcessor: 'Laundroworks',
                        totalAmount: 17.24,
                        createdAt: now,
                    },
                    {
                        paymentProcessor: 'cash',
                        totalAmount: 2.5,
                        createdAt: oneSecondLater,
                    },
                ],
            );

        // Additional order
        [serviceOrder4_LineDetail1, serviceOrder4_LineDetail2] =
            await createCompletedServiceOrderWithItemsAndPayments(
                storesIds[0],
                [
                    {
                        lineItemTotalCost: 23.5,
                        serviceCategoryType: serviceCategoryTypes.LAUNDRY,
                        category: serviceCategoriesLaundry[0].category,
                    },
                    {
                        lineItemTotalCost: 1,
                        serviceCategoryType: serviceCategoryTypes.DRY_CLEANING,
                        category: serviceCategoriesDryCleaning[1].category,
                    },
                ],
                [
                    {
                        paymentProcessor: 'cash',
                        totalAmount: 24.5,
                    },
                ],
            );

        // Inventory orders
        [inventoryOrder1_Item1, inventoryOrder1_Item2] =
            await createCompletedInventoryOrderWithItemsAndPayments(
                storesIds[0],
                [
                    {
                        categoryId: inventoryCategories[0].id,
                        lineItemTotalCost: 1.99,
                    },
                    {
                        categoryId: inventoryCategories[1].id,
                        lineItemTotalCost: 2.99,
                    },
                ],
                {
                    paymentProcessor: 'CCI',
                    totalAmount: 4.98,
                },
            );

        [inventoryOrder2_Item1, inventoryOrder2_Item2] =
            await createCompletedInventoryOrderWithItemsAndPayments(
                storesIds[1],
                [
                    {
                        categoryId: inventoryCategories[1].id,
                        lineItemTotalCost: 9.99,
                    },
                    {
                        categoryId: inventoryCategories[0].id,
                        lineItemTotalCost: 3,
                    },
                ],
                {
                    paymentProcessor: 'stripe',
                    totalAmount: 12.99,
                },
            );
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndpoint);

    it('should return report for all stores', async () => {
        const params = {
            startDate,
            endDate,
            timeZone: 'America/New_York',
            allStoresCheck: true,
        };
        const { body } = await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });

        expectBaseSalesByServiceSubCategoryResponse(body);

        // Laundry
        expect(body.sales.categories[0].subcategories).to.deep.include(
            {
                name: serviceCategoriesLaundry[0].category,
                creditCard: 0,
                cashCard: serviceOrder3_LineDetail1.lineItemTotalCost,
                cash:
                    serviceOrder1_LineDetail1.lineItemTotalCost +
                    serviceOrder4_LineDetail1.lineItemTotalCost,
            },
            {
                name: serviceCategoriesLaundry[1].category,
                creditCard: serviceOrder2_LineDetail1.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
        );

        // Dry cleaning
        expect(body.sales.categories[1].subcategories).to.deep.include(
            {
                name: serviceCategoriesDryCleaning[0].category,
                creditCard: serviceOrder2_LineDetail2.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
            {
                name: serviceCategoriesDryCleaning[1].category,
                creditCard: 0,
                cashCard: serviceOrder3_LineDetail2.lineItemTotalCost,
                cash: serviceOrder4_LineDetail2.lineItemTotalCost,
            },
        );

        // Products
        expect(body.sales.categories[2].subcategories).to.deep.include(
            {
                name: inventoryCategories[0].name,
                creditCard:
                    serviceOrder2_LineDetail3.lineItemTotalCost +
                    inventoryOrder2_Item2.lineItemTotalCost,
                cashCard: inventoryOrder1_Item1.lineItemTotalCost,
                cash: 0,
            },
            {
                name: inventoryCategories[1].name,
                creditCard: inventoryOrder2_Item1.lineItemTotalCost,
                cashCard: inventoryOrder1_Item2.lineItemTotalCost,
                cash: serviceOrder3_LineDetail3.lineItemTotalCost,
            },
        );
    });

    it('should return report for specific stores', async () => {
        const params = {
            startDate,
            endDate,
            timeZone: 'America/New_York',
            stores: storesIds,
        };
        const { body } = await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });

        expectBaseSalesByServiceSubCategoryResponse(body);

        // Laundry
        expect(body.sales.categories[0].subcategories).to.deep.include(
            {
                name: serviceCategoriesLaundry[0].category,
                creditCard: 0,
                cashCard: serviceOrder3_LineDetail1.lineItemTotalCost,
                cash:
                    serviceOrder1_LineDetail1.lineItemTotalCost +
                    serviceOrder4_LineDetail1.lineItemTotalCost,
            },
            {
                name: serviceCategoriesLaundry[1].category,
                creditCard: serviceOrder2_LineDetail1.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
        );

        // Dry cleaning
        expect(body.sales.categories[1].subcategories).to.deep.include(
            {
                name: serviceCategoriesDryCleaning[0].category,
                creditCard: serviceOrder2_LineDetail2.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
            {
                name: serviceCategoriesDryCleaning[1].category,
                creditCard: 0,
                cashCard: serviceOrder3_LineDetail2.lineItemTotalCost,
                cash: serviceOrder4_LineDetail2.lineItemTotalCost,
            },
        );

        // Products
        expect(body.sales.categories[2].subcategories).to.deep.include(
            {
                name: inventoryCategories[0].name,
                creditCard:
                    serviceOrder2_LineDetail3.lineItemTotalCost +
                    inventoryOrder2_Item2.lineItemTotalCost,
                cashCard: inventoryOrder1_Item1.lineItemTotalCost,
                cash: 0,
            },
            {
                name: inventoryCategories[1].name,
                creditCard: inventoryOrder2_Item1.lineItemTotalCost,
                cashCard: inventoryOrder1_Item2.lineItemTotalCost,
                cash: serviceOrder3_LineDetail3.lineItemTotalCost,
            },
        );
    });

    it('should return report for a single store', async () => {
        const params = {
            startDate,
            endDate,
            timeZone: 'America/New_York',
            stores: [storesIds[1]],
        };
        const { body } = await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });

        expectBaseSalesByServiceSubCategoryResponse(body);

        // Laundry
        expect(body.sales.categories[0].subcategories).to.deep.include(
            {
                name: serviceCategoriesLaundry[0].category,
                creditCard: 0,
                cashCard: 0,
                cash: 0,
            },
            {
                name: serviceCategoriesLaundry[1].category,
                creditCard: serviceOrder2_LineDetail1.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
        );

        // Dry cleaning
        expect(body.sales.categories[1].subcategories).to.deep.include(
            {
                name: serviceCategoriesDryCleaning[0].category,
                creditCard: serviceOrder2_LineDetail2.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
            {
                name: serviceCategoriesDryCleaning[1].category,
                creditCard: 0,
                cashCard: 0,
                cash: 0,
            },
        );

        // Products
        expect(body.sales.categories[2].subcategories).to.deep.include(
            {
                name: inventoryCategories[0].name,
                creditCard:
                    serviceOrder2_LineDetail3.lineItemTotalCost +
                    inventoryOrder2_Item2.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
            {
                name: inventoryCategories[1].name,
                creditCard: inventoryOrder2_Item1.lineItemTotalCost,
                cashCard: 0,
                cash: 0,
            },
        );
    });
});

describe('test get customers report api', () => {
    const apiEndpoint = '/api/v1/business-owner/reports/customers';
    const currentDate = momenttz().tz(storeTimeZone);

    let store,
        token,
        user,
        business,
        teamMember,
        centsCustomer,
        storeCustomer,
        serviceOrder1,
        serviceOrder2,
        expectedCustomerType,
        businessCustomer;

    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        store = await factory.create(FN.store, {
            businessId: business.id,
            name: 'Avengers',
        });
        teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        token = generateToken({ id: user.id, teamMemberId: teamMember.id });
        centsCustomer = await factory.create(FN.centsCustomer, {
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        businessCustomer = await factory.create(FN.businessCustomer, {
            centsCustomerId: centsCustomer.id,
            isCommercial: false,
        });
        expectedCustomerType = businessCustomer.isCommercial ? 'Commercial' : 'Residential';
        storeCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
        });
        serviceOrder1 = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            promotionAmount: 10.0,
            netOrderTotal: 11,
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        serviceOrder2 = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            promotionAmount: 10.0,
            netOrderTotal: 1,
            createdAt: '2022-06-10T12:59:32.582Z',
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndpoint);

    it('should get customers report successfully with allStoresCheck', async () => {
        await StoreSettings.query()
            .patch({
                timeZone: storeTimeZone,
            })
            .whereIn('storeId', [store.id]);

        const res = await ChaiHttpRequestHelper.get(apiEndpoint, {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: userTimeZone,
            allStoresCheck: true,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);
        expect(res.body).to.have.property('customers');
        expect(res.body.customers.length).to.eq(1);
        expect(res.body.customers[0].customerName).to.eq(
            `${centsCustomer.firstName} ${centsCustomer.lastName}`,
        );
        expect(res.body.customers[0].customerEmail).to.eq(centsCustomer.email);
        expect(res.body.customers[0].customerPhoneNumber).to.eq(centsCustomer.phoneNumber);
        expect(res.body.customers[0].customerType).to.eq(expectedCustomerType);
        expect(res.body.customers[0].registerDate).to.eq(
            momenttz(centsCustomer.createdAt).tz(storeTimeZone).format('MM/DD/YYYY'),
        );
        expect(res.body.customers[0].registerLocation).to.eq(store.name);
        expect(res.body.customers[0].totalOrders).to.eq(2);
        expect(res.body.customers[0].totalOrderValue).to.eq(
            serviceOrder1.netOrderTotal + serviceOrder2.netOrderTotal,
        );
        expect(res.body.customers[0].averageOrderValue).to.eq(
            (serviceOrder1.netOrderTotal + serviceOrder2.netOrderTotal) / 2,
        );
        expect(res.body.customers[0].firstOrderDate).to.eq(
            momenttz(serviceOrder1.createdAt).tz(storeTimeZone).format('MM/DD/YYYY'),
        );
        expect(res.body.customers[0].firstOrderValue).to.eq(serviceOrder1.netOrderTotal);
        expect(res.body.customers[0].lastOrderDate).to.eq(
            momenttz(serviceOrder2.createdAt).tz(storeTimeZone).format('MM/DD/YYYY'),
        );
        expect(res.body.customers[0].lastOrderValue).to.eq(serviceOrder2.netOrderTotal);
        expect(res.body.customers[0].daysSinceLastOrder).to.eq(
            currentDate
                .startOf('day')
                .diff(momenttz(serviceOrder2.createdAt).tz(storeTimeZone).startOf('day'), 'days'),
        );
    });

    it('should get customers report successfully with stores', async () => {
        await StoreSettings.query()
            .patch({
                timeZone: storeTimeZone,
            })
            .whereIn('storeId', [store.id]);

        const res = await ChaiHttpRequestHelper.get(apiEndpoint, {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            allStoresCheck: false,
            stores: [store.id],
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);
        expect(res.body).to.have.property('customers');
        expect(res.body.customers.length).to.eq(1);
        expect(res.body.customers[0].customerName).to.eq(
            `${centsCustomer.firstName} ${centsCustomer.lastName}`,
        );
        expect(res.body.customers[0].customerEmail).to.eq(centsCustomer.email);
        expect(res.body.customers[0].customerPhoneNumber).to.eq(centsCustomer.phoneNumber);
        expect(res.body.customers[0].customerType).to.eq(expectedCustomerType);
        expect(res.body.customers[0].registerDate).to.eq(
            momenttz(centsCustomer.createdAt).tz(storeTimeZone).format('MM/DD/YYYY'),
        );
        expect(res.body.customers[0].registerLocation).to.eq(store.name);
        expect(res.body.customers[0].totalOrders).to.eq(2);
        expect(res.body.customers[0].totalOrderValue).to.eq(
            serviceOrder1.netOrderTotal + serviceOrder2.netOrderTotal,
        );
        expect(res.body.customers[0].averageOrderValue).to.eq(
            (serviceOrder1.netOrderTotal + serviceOrder2.netOrderTotal) / 2,
        );
        expect(res.body.customers[0].firstOrderDate).to.eq(
            momenttz(serviceOrder1.createdAt).tz(storeTimeZone).format('MM/DD/YYYY'),
        );
        expect(res.body.customers[0].firstOrderValue).to.eq(serviceOrder1.netOrderTotal);
        expect(res.body.customers[0].lastOrderDate).to.eq(
            momenttz(serviceOrder2.createdAt).tz(storeTimeZone).format('MM/DD/YYYY'),
        );
        expect(res.body.customers[0].lastOrderValue).to.eq(serviceOrder2.netOrderTotal);
        expect(res.body.customers[0].daysSinceLastOrder).to.eq(
            currentDate
                .startOf('day')
                .diff(momenttz(serviceOrder2.createdAt).tz(storeTimeZone).startOf('day'), 'days'),
        );
    });

    it('should get empty customers report if customer is archived for business', async () => {
        await BusinessCustomer.query()
            .patch({
                deletedAt: '2022-08-10T12:59:32.582Z',
            })
            .where({'centsCustomerId': centsCustomer.id, 'businessId': business.id});

        const res = await ChaiHttpRequestHelper.get(apiEndpoint, {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            allStoresCheck: false,
            stores: [store.id],
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);
        expect(res.body).to.have.property('customers');
        expect(res.body.customers).to.be.empty;
    });

    it('should throw an error if params is not correct', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndpoint, {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: userTimeZone,
            allStoresCheck: false,
            stores: '',
        }).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error').contains('invalid input syntax');
    });
});

describe('test get sales tax report api', () => {
    const apiEndpoint = '/api/v1/business-owner/reports/stores/sales-tax';

    let store, token, user, business, teamMember, taxRate, serviceOrder1, serviceOrder2, serviceOrder3, inventoryOrder1, inventoryOrder2;

    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        taxRate = await factory.create(FN.taxRate, {
            businessId: business.id,
            name: 'Texas State',
        });

        store = await factory.create(FN.store, {
            businessId: business.id,
            taxRateId: taxRate.id,
            name: 'Netflix',
        });
        teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        token = generateToken({ id: user.id, teamMemberId: teamMember.id });

        // completed service order
        serviceOrder1 = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 11,
            taxAmountInCents: 200,
            status: 'COMPLETED',
            createdAt: '2022-05-08T12:59:32.582Z',
        });
        await factory.create(FN.serviceOrderMasterOrder, { orderableId: serviceOrder1.id, storeId: serviceOrder1.storeId })

        // completed service order
        serviceOrder2 = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 20,
            taxAmountInCents: 400,
            status: 'COMPLETED',
            createdAt: '2022-06-10T12:59:32.582Z',
        });
        await factory.create(FN.serviceOrderMasterOrder, { orderableId: serviceOrder2.id, storeId: serviceOrder2.storeId })

        // active order
        serviceOrder3 = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 40,
            taxAmountInCents: 700,
            status: 'READY_FOR_PROCESSING',
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        await factory.create(FN.serviceOrderMasterOrder, { orderableId: serviceOrder3.id, storeId: serviceOrder3.storeId })

        // completed inventory order
        inventoryOrder1 = await factory.create(FN.inventoryOrder, {
            storeId: store.id,
            netOrderTotal: 0,
            salesTaxAmount: 400,
            status: 'COMPLETED',
            createdAt: '2022-06-09T12:59:32.582Z',
        });
        await factory.create(FN.inventoryOrderMasterOrder, { orderableId: inventoryOrder1.id, storeId: inventoryOrder1.storeId })

        // active inventory order
        inventoryOrder2 = await factory.create(FN.inventoryOrder, {
            storeId: store.id,
            netOrderTotal: 20,
            salesTaxAmount: 400,
            status: 'PENDING',
            createdAt: '2022-06-10T12:59:32.582Z',
        });
        await factory.create(FN.inventoryOrderMasterOrder, { orderableId: inventoryOrder2.id, storeId: inventoryOrder2.storeId })
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => apiEndpoint,
    );

    it('should get sales tax report successfully with allStoresCheck', async () => {

        const taxRate2 = await factory.create(FN.taxRate, {
            businessId: business.id,
            name: 'MS Sales Tax',
        });

        const store2 = await factory.create(FN.store, {
            businessId: business.id,
            taxRateId: taxRate2.id,
            name: 'Hotstar',
        });

        // completed service order
        const serviceOrder4 = await factory.create(FN.serviceOrder, {
            storeId: store2.id,
            netOrderTotal: 20,
            taxAmountInCents: 900,
            status: 'COMPLETED',
            createdAt: '2022-06-10T12:59:32.582Z',
        });

        await factory.create(FN.serviceOrderMasterOrder, { orderableId: serviceOrder4.id, storeId: serviceOrder4.storeId })

        // completed inventory order
        const inventoryOrder3 = await factory.create(FN.inventoryOrder, {
            storeId: store2.id,
            netOrderTotal: 0,
            salesTaxAmount: 400,
            status: 'COMPLETED',
            createdAt: '2022-06-09T12:59:32.582Z',
        });
        await factory.create(FN.inventoryOrderMasterOrder, { orderableId: inventoryOrder3.id, storeId: inventoryOrder3.storeId })
        const res = await ChaiHttpRequestHelper.get(apiEndpoint, {
            startDate: '2022-05-08T12:59:32.582Z',
            endDate: '2022-06-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            allStoresCheck: true,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);

        expect(res.body.taxRates.length).to.eq(2)
        expect(res.body.taxRates[0].totalServiceTaxAmount).to.eq((serviceOrder1.taxAmountInCents + serviceOrder2.taxAmountInCents).toString());
        expect(res.body.taxRates[0].totalProductTaxAmount).to.eq((inventoryOrder1.salesTaxAmount).toString());
        expect(res.body.taxRates[0].taxRateRate).to.eq(taxRate.rate);
        expect(res.body.taxRates[0].taxRateName).to.eq(taxRate.name);
        expect(res.body.taxRates[0].storeName).to.eq(store.name);
        expect(res.body.taxRates[1].totalServiceTaxAmount).to.eq((serviceOrder4.taxAmountInCents).toString());
        expect(res.body.taxRates[1].totalProductTaxAmount).to.eq((inventoryOrder2.salesTaxAmount).toString());
        expect(res.body.taxRates[1].taxRateRate).to.eq(taxRate2.rate);
        expect(res.body.taxRates[1].taxRateName).to.eq(taxRate2.name);
        expect(res.body.taxRates[1].storeName).to.eq(store2.name);
    });

    it('should get sales tax report successfully with stores', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndpoint, {
            startDate: '2022-05-11T12:59:32.582Z',
            endDate: '2022-06-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            allStoresCheck: false,
            stores: [store.id],
        }).set('authtoken', token);


        expect(res.body.taxRates[0].totalServiceTaxAmount).to.eq(serviceOrder2.taxAmountInCents.toString());
        expect(res.body.taxRates[0].totalProductTaxAmount).to.eq((inventoryOrder1.salesTaxAmount).toString());
        expect(res.body.taxRates[0].taxRateRate).to.eq(taxRate.rate);
        expect(res.body.taxRates[0].taxRateName).to.eq(taxRate.name);
        expect(res.body.taxRates[0].storeName).to.eq(store.name);
    });

    it('should throw an error if params is not correct', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndpoint, {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-06-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            allStoresCheck: false,
            stores: '',
        }).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error');
    });
});

describe('test get new customer report api', () => {
    const apiEndpoint = '/api/v1/business-owner/reports/customers/new/list';
    const timeZone = 'America/New_York';
    let params, store1, store2, token, user, business;

    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        store1 = await factory.create(FN.store, {
            businessId: business.id,
            name: 'Avengers',
        });
        store2 = await factory.create(FN.store, {
            businessId: business.id,
            name: 'Justice League',
        });
        await StoreSettings.query()
            .patch({
                timeZone,
            })
            .whereIn('storeId', [store1.id, store2.id]);
        token = generateToken({ id: user.id });
        const storeCustomer1 = await factory.create(FN.storeCustomer, {
            firstName: 'John',
            lastName: 'Doe',
            storeId: store1.id,
            createdAt: '2022-08-04T12:59:32.582Z',
        });
        const storeCustomer2 = await factory.create(FN.storeCustomer, {
            firstName: 'Brie',
            lastName: 'Larson',
            storeId: store2.id,
            createdAt: '2022-08-05T12:59:32.582Z',
        });
        await factory.create(FN.serviceOrder, {
            storeId: store1.id,
            storeCustomerId: storeCustomer1.id,
            netOrderTotal: 15,
            createdAt: '2022-08-06T12:59:32.582Z',
        });
        await createInventoryOrderWithLineItems(
            {
                storeId: store2.id,
                storeCustomerId: storeCustomer2.id,
                netOrderTotal: 25,
            },
            {
                lineItemTotalCost: 25,
            },
        )
        await createInventoryOrderWithLineItems(
            {
                storeId: store1.id,
                storeCustomerId: storeCustomer1.id,
                netOrderTotal: 10,
            },
            {
                lineItemTotalCost: 10,
            },
        )
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => apiEndpoint,
    );
    
    describe('with allStoresCheck', () => {
        beforeEach(() => {
            params = {
                startDate: '2022-08-01T12:59:32.582Z',
                endDate: '2022-08-10T12:59:32.582Z',
                timeZone,
                allStoresCheck: true,
            }
        });

        it('should have fullName for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const fullName = map(body.newCustomers, 'fullName')
            expect(body).to.have.property('success').to.equal(true);
            expect(fullName).to.have.members(['John Doe', 'Brie Larson']);
        });

        it('should have firstVisitAmount for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const firstVisitAmount = map(body.newCustomers, 'firstVisitAmount')
            expect(body).to.have.property('success').to.equal(true);
            expect(firstVisitAmount).to.have.members([25,15]);
        });

        it('should have registerLocation for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const registerLocation = map(body.newCustomers, 'registerLocation')
            expect(body).to.have.property('success').to.equal(true);
            expect(registerLocation).to.have.members(['Avengers', 'Justice League']);
        });

        it('should have registerDate for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const registerDate = map(body.newCustomers, 'registerDate')
            expect(body).to.have.property('success').to.equal(true);
            expect(registerDate).to.have.members(['08/05/2022', '08/04/2022']);
        });
        
        it('should not include duplicate records', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const firstVisitAmount = map(body.newCustomers, 'firstVisitAmount')
            expect(body).to.have.property('success').to.equal(true);
            expect(body.newCustomers).to.be.lengthOf(2);
            expect(firstVisitAmount).to.not.have.members([10]);
        });

        it('should have new customer with no orders placed', async () => {
            const store3 = await factory.create(FN.store, {
                businessId: business.id,
                name: 'Unicorn',
            });
            await factory.create(FN.storeCustomer, {
                firstName: 'Nick',
                lastName: 'Cargo',
                storeId: store3.id,
                createdAt: '2022-08-04T12:59:32.582Z',
            });
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const fullName = map(body.newCustomers, 'fullName')
            expect(body).to.have.property('success').to.equal(true);
            expect(fullName).to.have.members(['John Doe', 'Brie Larson', 'Nick Cargo']);
        });

        describe('with customers who have not placed any orders', () => {
            beforeEach(async () => {
                await factory.create(FN.storeCustomer, {
                    firstName: 'Hulk',
                    lastName: 'Hoogan',
                    storeId: store1.id,
                    createdAt: '2022-08-06T12:59:32.582Z',
                });
            });

            it('should have full name of new customer', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });
                const fullName = map(body.newCustomers, 'fullName')
                expect(body).to.have.property('success').to.equal(true);
                expect(fullName).to.have.members(['John Doe', 'Brie Larson', 'Hulk Hoogan']);
            });

            it('should have register date of new customer', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });
                const registerDate = map(body.newCustomers, 'registerDate')
                expect(body).to.have.property('success').to.equal(true);
                expect(registerDate).to.have.members(['08/04/2022', '08/05/2022', '08/06/2022']);
            });

            it('should have register location of new customer', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });
                const registerLocation = [...new Set(map(body.newCustomers, 'registerLocation'))];
                expect(body).to.have.property('success').to.equal(true);
                expect(registerLocation).to.have.members(['Avengers', 'Justice League']);
            });

            it('should have first visit amount as 0 for new customer', async () => {
                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });
                const firstVisitAmount = map(body.newCustomers, 'firstVisitAmount')
                expect(body).to.have.property('success').to.equal(true);
                expect(firstVisitAmount).to.have.members([25,15,0]);
            });
        });
    });

    describe('with stores', () => {
        beforeEach(() => {
            params = {
                startDate: '2022-08-01T12:59:32.582Z',
                endDate: '2022-08-10T12:59:32.582Z',
                timeZone: 'America/New_York',
                allStoresCheck: false,
                stores: [store1.id, store2.id]
            }
        });

        it('should have fullName for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const fullName = map(body.newCustomers, 'fullName')
            expect(body).to.have.property('success').to.equal(true);
            expect(fullName).to.have.members(['John Doe', 'Brie Larson']);
        });

        it('should have firstVisitAmount for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const firstVisitAmount = map(body.newCustomers, 'firstVisitAmount')
            expect(body).to.have.property('success').to.equal(true);
            expect(firstVisitAmount).to.have.members([25,15]);
        });

        it('should have registerLocation for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const registerLocation = map(body.newCustomers, 'registerLocation')
            expect(body).to.have.property('success').to.equal(true);
            expect(registerLocation).to.have.members(['Avengers', 'Justice League']);
        });

        it('should have registerDate for all new customers', async () => {
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const registerDate = map(body.newCustomers, 'registerDate')
            expect(body).to.have.property('success').to.equal(true);
            expect(registerDate).to.have.members(['08/05/2022', '08/04/2022']);
        });

        it('should have details of new customer for store1', async () => {
            const paramsCopy = { ...params }
            paramsCopy.stores.pop();
            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });
            const fullName = map(body.newCustomers, 'fullName')
            expect(body).to.have.property('success').to.equal(true);
            expect(fullName).to.have.members(['John Doe']);
        });
    });

    it('should fail with empty params', async () => {
        await assertGetResponseError({
            url: apiEndpoint,
            token,
            code: 500
        });
    });
});
