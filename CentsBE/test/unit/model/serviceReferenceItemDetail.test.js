require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne, hasOne, hasMany } = require('../../support/objectionTestHelper');
const ServiceReferenceItemDetail = require('../../../models/serviceReferenceItemDetail');
const InventoryItem = require('../../../models/inventoryItem');
const ServicesMaster = require('../../../models/services');
const ServicePrice = require('../../../models/servicePrices');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');

describe('test ServiceReferenceItemDetail model', () => {

    it('should return true if ServiceReferenceItemDetail table exists', async () => {
        const hasTableName = await hasTable(ServiceReferenceItemDetail.tableName);
        expect(hasTableName).to.be.true
    });

    it('ServiceReferenceItemDetail should have serviceReferenceItem association', async () => {
        hasAssociation(ServiceReferenceItemDetail, 'serviceReferenceItem');
    });

    it('ServiceReferenceItemDetail should have BelongsToOneRelation serviceReferenceItem association', async () => {
        belongsToOne(ServiceReferenceItemDetail, 'serviceReferenceItem');
    });

    it('ServiceReferenceItemDetail should have serviceMaster association', async () => {
        hasAssociation(ServiceReferenceItemDetail, 'serviceMaster');
    });

    it('ServiceReferenceItemDetail should have HasOneRelation serviceMaster association', async () => {
        hasOne(ServiceReferenceItemDetail, 'serviceMaster');
    });

    it('ServiceReferenceItemDetail should have inventoryItem association', async () => {
        hasAssociation(ServiceReferenceItemDetail, 'inventoryItem');
    });

    it('ServiceReferenceItemDetail should have HasOneRelation inventoryItem association', async () => {
        hasOne(ServiceReferenceItemDetail, 'inventoryItem');
    });

    it('ServiceReferenceItemDetail should have servicePrice association', async () => {
        hasAssociation(ServiceReferenceItemDetail, 'servicePrice');
    });

    it('ServiceReferenceItemDetail should have HasOneRelation servicePrice association', async () => {
        hasOne(ServiceReferenceItemDetail, 'servicePrice');
    });

    it('ServiceReferenceItemDetail should have modifierLineItems association', async () => {
        hasAssociation(ServiceReferenceItemDetail, 'modifierLineItems');
    });

    it('ServiceReferenceItemDetail should have HasManyRelation modifierLineItems association', async () => {
        hasMany(ServiceReferenceItemDetail, 'modifierLineItems');
    });

    it('ServiceReferenceItemDetail model should have getServiceReferenceItem method when created', async () => {
        const serviceReferenceItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice);
        expect(serviceReferenceItem.getServiceReferenceItem).to.be.a('function');
    });

    it('retrieveProperModel should return InventoryItem when called for a ServiceReferenceItem created for an InventoryItem', async () => {
        const serviceReferenceItemDetail = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForInventoryItem);
        const result = serviceReferenceItemDetail.retrieveProperModel();
        expect(result).to.equal(InventoryItem);
    });

    it('retrieveProperModel should return ServiceMaster when called for a ServiceReferenceItem created for an ServiceMaster', async () => {
        const serviceReferenceItemDetail = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServiceMaster);
        const result = serviceReferenceItemDetail.retrieveProperModel();
        expect(result).to.equal(ServicesMaster);
    });

    it('retrieveProperModel should return ServicePrice when called for a ServiceReferenceItem created for an ServicePrice', async () => {
        const serviceReferenceItemDetail = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice);
        const result = serviceReferenceItemDetail.retrieveProperModel();
        expect(result).to.equal(ServicePrice);
    });

    it('ServiceReferenceItemDetail should have updatedAt field when updated for beforeUpdate hook', async () => {
        const lineItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice);
        const initialLineItem = await ServiceReferenceItemDetail.query()
            .findById(lineItem.id);
        const updatedLineItem = await ServiceReferenceItemDetail.query()
            .patch({
                lineItemName: 'new name',
            })
            .findById(initialLineItem.id)
            .returning('*');
        expect(updatedLineItem.updatedAt).to.not.be.null;
        expect(updatedLineItem.updatedAt).to.not.be.undefined;
        expect(updatedLineItem.updatedAt).to.be.a.dateString();
    });

    it('should return SoldItemModel for InventoryItem successfully', async () => {
        const serviceReferenceItemDetail = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForInventoryItem);
        expect(serviceReferenceItemDetail.getSoldItemReference()).to.not.equal(null);
        expect(serviceReferenceItemDetail.getSoldItemReference()).to.not.equal(undefined);
    });

    it('should return SoldItemModel for ServicePrice successfully', async () => {
        const serviceReferenceItemDetail = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice);
        expect(serviceReferenceItemDetail.getSoldItemReference()).to.not.equal(null);
        expect(serviceReferenceItemDetail.getSoldItemReference()).to.not.equal(undefined);
    });

    it('should return SoldItemModel for ServicesMaster successfully', async () => {
        const serviceReferenceItemDetail = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServiceMaster);
        expect(serviceReferenceItemDetail.getSoldItemReference()).to.not.equal(null);
        expect(serviceReferenceItemDetail.getSoldItemReference()).to.not.equal(undefined);
    });

    it('ServiceReferenceItemDetail model should have getServiceReferenceItem method when created', async () => {
        const serviceReferenceItemDetail = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice);
        expect(serviceReferenceItemDetail.getServiceReferenceItem).to.be.a('function');
    });
});
