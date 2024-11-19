const { CENTS_IN_A_DOLLAR } = require('../constants/constants');

/**
 * This utility method will convert amount of cents to dollars
 * and returns amount of dollars
 *
 * @param {number} amountInCents
 * @return {number}
 */
function convertCentsToDollars(amountInCents) {
    const amountParsed = Number(amountInCents);
    if (Number.isNaN(amountParsed)) {
        throw new Error('Not a number passed to function');
    }
    return amountParsed / CENTS_IN_A_DOLLAR;
}

/**
 * This utility method will convert amount of dollars to cents
 * and returns amount of cents
 *
 * @param {number} amountInDollars
 * @return {number}
 */
function convertDollarsToCents(amountInDollars) {
    const amountParsed = Number(amountInDollars);
    if (Number.isNaN(amountParsed)) {
        throw new Error('Not a number passed to function');
    }
    return Math.round(amountParsed * CENTS_IN_A_DOLLAR);
}

module.exports = { convertCentsToDollars, convertDollarsToCents };
