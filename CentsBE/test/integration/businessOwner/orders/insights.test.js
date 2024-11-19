const momenttz = require('moment-timezone');
const { omit } = require('lodash');

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const StoreSettings = require('../../../../models/storeSettings');
const InventoryOrder = require('../../../../models/inventoryOrders');

const startOfTheMonth = momenttz().tz('America/Los_Angeles').startOf('month').format()
const previousMonth = momenttz().tz('America/Los_Angeles').startOf('month').add(-1, 'day').format()
const nextDay = momenttz().tz('America/Los_Angeles').startOf('month').add(1, 'day').format()
const currentDate = momenttz().tz('America/Los_Angeles').format()

describe('tests order insights api', () => {
    const ENDPOINT_URL = '/api/v1/business-owner/orders/insights';
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
            user = await factory.create('userWithBusinessOwnerRole');
            business = await factory.create('laundromatBusiness', { userId: user.id });
            store = await factory.create('store', {
                businessId: business.id,
            });
            store2 = await factory.create('store', { businessId: business.id });
            await StoreSettings.query()
                .patch({
                    timeZone: 'America/Los_Angeles',
                })
                .whereIn('storeId', [store.id, store2.id]);

            params = {
                stores: [store.id, store2.id],
            };
            teamMember = await factory.create('teamMember', {
                userId: user.id,
                businessId: business.id,
            });
            token = await generateToken({ id: user.id, teamMemberId: teamMember.id });
        });

        describe('validate query params', () => {
            it('should respond with a 422 when stores param is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(
                    ENDPOINT_URL,
                    omit(params, 'stores'),
                ).set('authtoken', token);
                res.should.have.status(422);
            });
        });

        describe('test filters', () => {
            describe('with service orders', () => {
                it('should exclude cancelled orders', async () => {
                    await factory.create('serviceOrder', {
                        status: 'CANCELLED',
                        storeId: store.id,
                        netOrderTotal: 10,
                        placedAt: currentDate,
                    });
                    await factory.create('serviceOrder', {
                        status: 'SUBMITTED',
                        storeId: store.id,
                        netOrderTotal: 15,
                        placedAt: nextDay,
                    });
                    await factory.create('serviceOrder', {
                        status: 'SUBMITTED',
                        storeId: store.id,
                        netOrderTotal: 20,
                        placedAt: startOfTheMonth,
                    });
                    await factory.create('serviceOrder', {
                        status: 'SUBMITTED',
                        storeId: store.id,
                        netOrderTotal: 20,
                        placedAt: currentDate,
                    });
                    const res = await ChaiHttpRequestHelper.get(
                        ENDPOINT_URL, params,
                    ).set('authtoken', token);
                    res.should.have.status(200);
                    const insights = res.body.insights
                    expect(insights['totalOrders']).to.be.eql('3')
                    expect(insights['totalOrdersValue']).to.be.eql(55)
                    expect(insights['averageOrderValue']).to.be.eql(18.33)
                });

                it('should consider 0 as net order total when net order total is NaN', async () => {

                    await factory.create('serviceOrder', {
                        status: 'SUBMITTED',
                        storeId: store.id,
                        netOrderTotal: 'NaN',
                        placedAt: nextDay,
                    });
                    await factory.create('serviceOrder', {
                        status: 'SUBMITTED',
                        storeId: store.id,
                        netOrderTotal: 20,
                        placedAt: currentDate,
                    });
                    const res = await ChaiHttpRequestHelper.get(
                        ENDPOINT_URL, params,
                    ).set('authtoken', token);
                    res.should.have.status(200);
                    const insights = res.body.insights
                    expect(insights['totalOrders']).to.be.eql('2')
                    expect(insights['totalOrdersValue']).to.be.eql(20)
                    expect(insights['averageOrderValue']).to.be.eql(10)
                });

                it('should exclude previous month orders', async () => {
                    await factory.create('serviceOrder', {
                        status: 'SUBMITTED',
                        storeId: store.id,
                        netOrderTotal: 20,
                        placedAt: currentDate,
                    });
                    await factory.create('serviceOrder', {
                        status: 'COMPLETED',
                        storeId: store.id,
                        netOrderTotal: 30,
                        placedAt: previousMonth,
                    });
                    const res = await ChaiHttpRequestHelper.get(
                        ENDPOINT_URL, params,
                    ).set('authtoken', token);
                    res.should.have.status(200);
                    const insights = res.body.insights
                    expect(insights['totalOrders']).to.be.eql('1')
                    expect(insights['totalOrdersValue']).to.be.eql(20)
                    expect(insights['averageOrderValue']).to.be.eql(20.00)
                });
            });
            describe('with inventory orders', () => {
                it('should include only completed orders', async () => {
                    await factory.create('inventoryOrder', {
                        status: 'CANCELLED',
                        storeId: store.id,
                        netOrderTotal: 10,
                        createdAt: currentDate,
                    });
                    const inventory1 = await factory.create('inventoryOrder', {
                        status: 'COMPLETED',
                        storeId: store.id,
                        netOrderTotal: 15,
                        createdAt: currentDate,
                    });
                    const inventory2 = await factory.create('inventoryOrder', {
                        status: 'COMPLETED',
                        storeId: store.id,
                        netOrderTotal: 22,
                        createdAt: currentDate,
                    });
                    await factory.create('inventoryOrder', {
                        status: 'CREATED',
                        storeId: store.id,
                        netOrderTotal: 20,
                        createdAt: currentDate,
                    });
                    await InventoryOrder.query().patch({ status: 'COMPLETED' }).whereIn('id', [inventory1.id, inventory2.id]);

                    const res = await ChaiHttpRequestHelper.get(
                        ENDPOINT_URL, params,
                    ).set('authtoken', token);
                    res.should.have.status(200);
                    const insights = res.body.insights
                    expect(insights['totalOrders']).to.be.eql('2')
                    expect(insights['totalOrdersValue']).to.be.eql(37)
                    expect(insights['averageOrderValue']).to.be.eql(18.50)
                });

                it('should exclude previous month orders', async () => {
                    const inventory1 = await factory.create('inventoryOrder', {
                        status: 'COMPLETED',
                        storeId: store.id,
                        netOrderTotal: 20,
                        createdAt: currentDate,
                    });
                    const inventory2 = await factory.create('inventoryOrder', {
                        status: 'COMPLETED',
                        storeId: store.id,
                        netOrderTotal: 30,
                        createdAt: previousMonth,
                    });
                    await InventoryOrder.query().patch({ status: 'COMPLETED' }).whereIn('id', [inventory1.id, inventory2.id]);
                    const res = await ChaiHttpRequestHelper.get(
                        ENDPOINT_URL, params,
                    ).set('authtoken', token);
                    res.should.have.status(200);
                    const insights = res.body.insights
                    expect(insights['totalOrders']).to.be.eql('1')
                    expect(insights['totalOrdersValue']).to.be.eql(20)
                    expect(insights['averageOrderValue']).to.be.eql(20.00)
                });
            });
        });
    });
});
