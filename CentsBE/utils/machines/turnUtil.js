/**
 * Count total turn time in minutes
 * @param {Array<{id: number, turnId: number, turnTime: string, quantity: number, unitPriceInCents: number}>} turnLineItems
 * @returns number
 */
const getTotalTurnTimeInMinutes = (turnLineItems = []) => {
    if (!turnLineItems?.length) {
        return 0;
    }

    return turnLineItems.reduce((prev, cur) => Number(prev) + Number(cur.turnTime), 0);
};

module.exports = {
    getTotalTurnTimeInMinutes,
};
