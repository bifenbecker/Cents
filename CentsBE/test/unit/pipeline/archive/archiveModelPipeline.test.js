require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const archiveModelPipeline = require('../../../../pipeline/archive/archiveModelPipeline');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const Inventory = require('../../../../models/inventory');
const InventoryItem = require('../../../../models/inventoryItem');

describe('test archiveModelPipeline', () => {
    it('should archive Inventory and InventoryItem', async () => {
        const inventory = await factory.create(FN.inventory);
        const inventoryItem = await factory.create(FN.inventoryItem, {
            inventoryId: inventory.id,
        });
        const payload = {
            modelName: Inventory,
            modelChildName: InventoryItem,
            modelId: inventory.id,
            archiveBoolean: true,
        };
        const result = await archiveModelPipeline(payload);

        const archivedInventory = await Inventory.query().findById(inventory.id);
        const archivedInventoryItem = await InventoryItem.query().findById(inventoryItem.id);

        expect(result.archivedModel.id).to.equal(archivedInventory.id);
        expect(result.archivedModelChildren[0].id).to.equal(archivedInventoryItem.id);
        expect(result.archivedModelChildren.length).to.equal(1);
        expect(result.archivedModel.isDeleted).to.be.true;
        expect(result.archivedModelChildren[0].isDeleted).to.be.true;
        expect(archivedInventoryItem.isDeleted).to.be.true;
        expect(archivedInventory.isDeleted).to.be.true;
    });

    it('should unarchive Inventory and InventoryItem', async () => {
        const inventory = await factory.create(FN.inventory, {
            isDeleted: true,
        });
        const inventoryItem = await factory.create(FN.inventoryItem, {
            inventoryId: inventory.id,
            isDeleted: true,
        });
        const payload = {
            modelName: Inventory,
            modelChildName: InventoryItem,
            modelId: inventory.id,
            archiveBoolean: false,
        };
        const result = await archiveModelPipeline(payload);

        const archivedInventory = await Inventory.query().findById(inventory.id);
        const archivedInventoryItem = await InventoryItem.query().findById(inventoryItem.id);

        expect(result.archivedModel.id).to.equal(archivedInventory.id);
        expect(result.archivedModelChildren[0].id).to.equal(archivedInventoryItem.id);
        expect(result.archivedModelChildren.length).to.equal(1);
        expect(result.archivedModel.isDeleted).to.be.false;
        expect(result.archivedModelChildren[0].isDeleted).to.be.false;
        expect(archivedInventoryItem.isDeleted).to.be.false;
        expect(archivedInventory.isDeleted).to.be.false;
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(archiveModelPipeline()).to.be.rejected;
        await expect(archiveModelPipeline(null)).to.be.rejected;
        await expect(archiveModelPipeline({})).to.be.rejected;
    });
});
