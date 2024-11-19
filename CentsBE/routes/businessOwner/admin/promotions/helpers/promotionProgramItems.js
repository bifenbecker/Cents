/**
 * Take each promotionProgramItem object and add the businessId to it
 *
 * @param {Array} items
 * @param {Number} businessId
 */
async function addBusinessIdToProgramItems(items, businessId) {
    const mappedItems = items.map((item) => ({
        ...item,
        businessId,
    }));

    return mappedItems;
}

module.exports = exports = { addBusinessIdToProgramItems };
