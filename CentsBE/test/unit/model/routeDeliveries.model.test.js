require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');
const {
    belongsToOne,
    hasTable,
    hasMany,
    hasAssociation,
} = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const RouteDelivery = require('../../../models/routeDeliveries');

describe('test RouteDelivery model', () => {
    it('should return true if RouteDelivery table exists', async () => {
        const hasTableName = await hasTable(RouteDelivery.tableName);
        expect(hasTableName).to.be.true;
    });

    it('RouteDelivery should have route association', async () => {
        hasAssociation(RouteDelivery, 'route');
    });

    it('RouteDelivery should have BelongsToOneRelation route association', async () => {
        belongsToOne(RouteDelivery, 'route');
    });

    it('RouteDelivery should have routeDeliveryActivityLogs association', async () => {
        hasAssociation(RouteDelivery, 'routeDeliveryActivityLogs');
    });

    it('RouteDelivery should have HasManyRelation routeDeliveryActivityLogs association', async () => {
        hasMany(RouteDelivery, 'routeDeliveryActivityLogs');
    });

    it('RouteDelivery should have serviceOrderRouteDeliveries association', async () => {
        hasAssociation(RouteDelivery, 'serviceOrderRouteDeliveries');
    });

    it('RouteDelivery should have HasManyRelation serviceOrderRouteDeliveries association', async () => {
        hasMany(RouteDelivery, 'serviceOrderRouteDeliveries');
    });

    it('RouteDelivery should have orderDelivery association', async () => {
        hasAssociation(RouteDelivery, 'orderDelivery');
    });

    it('RouteDelivery should have BelongsToOneRelation orderDelivery association', async () => {
        belongsToOne(RouteDelivery, 'orderDelivery');
    });

    it('RouteDelivery should have store association', async () => {
        hasAssociation(RouteDelivery, 'store');
    });

    it('RouteDelivery should have BelongsToOneRelation store association', async () => {
        belongsToOne(RouteDelivery, 'store');
    });

    it('RouteDelivery should have updatedAt field when updated for beforeUpdate hook', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FACTORIES_NAMES.routeDelivery,
            factoryData: {},
            model: RouteDelivery,
            patchPropName: 'notes',
            patchPropValue: 'test',
        });
    });
});
