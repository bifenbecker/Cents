const stripe = require('../../../stripe/stripeWithSecret');

/**
 * Retrieve the list of payouts for the given business and time parameters
 *
 * @param {Object} payload
 */
async function generateStripePayoutList(payload) {
    try {
        const newPayload = payload;
        const { options } = newPayload;
        const { formattedStartDate, formattedEndDate, business } = options;

        const stripePayouts = [];

        const queryParams = {
            created: {
                gte: formattedStartDate,
                lte: formattedEndDate,
            },
            limit: 100,
        };
        // loop limit is only 50 because of the rate_limit issue from the stripe.
        for (let i = 0; i < 50; i++) {
            const { data, has_more: hasMore } = await stripe.payouts.list(queryParams, {
                stripeAccount: business.merchantId,
            });
            stripePayouts.push(...data);
            if (!hasMore) {
                break;
            }
            if (hasMore) {
                queryParams.starting_after = stripePayouts[stripePayouts.length - 1].id;
            }
        }

        const successfulStripePayouts = stripePayouts.filter((item) => item.status !== 'failed');

        newPayload.stripePayouts = successfulStripePayouts;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = generateStripePayoutList;
