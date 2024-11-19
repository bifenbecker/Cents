function getIsTaxable(items) {
    const taxableItem = items.find((item) => {
        if (item.refItem[0].servicePrice) {
            return item.refItem[0].servicePrice.isTaxable;
        }
        if (item.refItem[0].inventoryItem) {
            return item.refItem[0].inventoryItem.isTaxable;
        }
        return null;
    });
    return !!taxableItem;
}

module.exports = exports = getIsTaxable;
