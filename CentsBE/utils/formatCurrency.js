/**
 * Format an incoming number into a currency value
 *
 * @param {Number} number
 */

module.exports = exports = async function formatCurrency(number) {
    const total = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        number,
    );

    return total;
};
