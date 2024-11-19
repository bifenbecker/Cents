const perPoundPriceCalculator = require('../../../../commons/priceCalculator');

class BaseItemBuilder {
    constructor(item, customer, status) {
        this.item = item;
        this.customer = customer;
        this.status = status;
        this.newItem = {};
        this.inventory = {};
    }

    build() {
        this.buildItemAttributes();
        this.buildReferenceItem();
        // this.addWeightLog();
        this.buildLineItemDetails();
        this.buildInventoryChanges();
        return {
            newItem: this.newItem,
            inventory: this.inventory,
        };
    }

    buildItemAttributes() {
        this.newItem.status = this.status;
        this.newItem.price = this.itemPrice();
    }

    buildReferenceItem() {
        this.newItem.referenceItems = {
            quantity: this.isModifier() ? 1 : this.item.count,
            totalPrice: this.newItem.price,
            unitCost: this.item.price,
            servicePriceId: this.item.lineItemType === 'SERVICE' ? this.item.priceId : null,
            inventoryItemId: this.item.lineItemType === 'INVENTORY' ? this.item.priceId : null,
            serviceModifierId: this.isModifier() ? this.item.serviceModifierId : null,
        };
    }

    buildLineItemDetails() {
        this.newItem.referenceItems.lineItemDetail = this.isModifier()
            ? this.modifierLineItemDetails()
            : this.nonModifierLineItemDetails();
    }

    nonModifierLineItemDetails() {
        return {
            soldItemType: this.soldItemType(),
            lineItemName: this.item.lineItemName,
            lineItemUnitCost: this.item.price,
            lineItemDescription: this.item.description,
            lineItemQuantity:
                this.item.servicePricingStructureType === 'PER_POUND'
                    ? this.item.weight
                    : this.item.count,
            lineItemTotalCost: this.newItem.price,
            soldItemId: this.item.priceId,
            lineItemMinPrice: this.item.hasMinPrice ? this.item.minimumPrice : null,
            lineItemMinQuantity: this.item.hasMinPrice ? this.item.minimumQuantity : null,
            category: this.item.category,
            ...this.customer,
            pricingType: this.item.servicePricingStructureType,
            serviceCategoryType: this.item.serviceCategoryType,
            modifierLineItems:
                this.item?.modifiers?.length > 0
                    ? this.mapServiceReferenceItemDetailModifiers()
                    : [],
        };
    }

    modifierLineItemDetails() {
        return {
            soldItemType: 'Modifier',
            lineItemName: this.item.name,
            lineItemUnitCost: this.item.price,
            lineItemDescription: this.item.description,
            soldItemId: this.item.serviceModifierId,
            lineItemQuantity: Number(this.item.weight),
            lineItemTotalCost: Number(this.item.weight) * Number(this.item.price),
            ...this.customer,
        };
    }

    mapServiceReferenceItemDetailModifiers() {
        const modifierArray = this.item?.modifiers.map((modifier) => ({
            modifierId: modifier.modifierId,
            modifierName: modifier.name,
            unitCost: modifier.price,
            quantity: Number(this.item?.weight || this.item?.count),
            totalCost: Number(
                Number(this.item?.weight || this.item?.count) * Number(modifier.price),
            ),
            modifierPricingType: modifier.modifierPricingType,
            modifierVersionId: modifier.latestModifierVersion,
        }));
        return modifierArray;
    }

    buildInventoryChanges() {
        if (!this.isInventory()) {
            this.inventory = {};
        } else {
            this.inventory = this.inventoryObj();
        }
    }

    isInventory() {
        return this.item.lineItemType === 'INVENTORY';
    }

    isPerPound() {
        return this.item.servicePricingStructureType === 'PER_POUND';
    }

    soldItemType() {
        if (this.item.lineItemType === 'SERVICE') {
            return 'ServicePrices';
        }
        if (this.item.lineItemType === 'INVENTORY') {
            return 'InventoryItem';
        }
        return 'Modifier';
    }

    itemPrice() {
        const {
            price,
            minimumQuantity,
            minimumPrice,
            hasMinPrice,
            count,
            servicePricingStructureType,
            weight,
        } = this.item;
        if (servicePricingStructureType !== 'PER_POUND') {
            if (this.soldItemType() === 'Modifier') {
                return price * weight;
            }
            return price * count;
        }
        return perPoundPriceCalculator(price, weight, minimumQuantity, minimumPrice, hasMinPrice);
    }

    isModifier() {
        return this.soldItemType() === 'Modifier';
    }
}

module.exports = exports = BaseItemBuilder;
