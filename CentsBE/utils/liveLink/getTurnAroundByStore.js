const { getCents20Flag } = require('../launchdarkly/launchDarklyUserUtils');
const { getTurnAroundForCents20 } = require('./getTurnAroundForCents20');
const { serviceCategoryTypes } = require('../../constants/constants');

async function getTurnAroundByStore(store, selectedServices, apiVersion) {
    const { businessId } = store;

    let turnAround;
    const cents20LdFlag = await getCents20Flag(apiVersion, businessId);

    if (cents20LdFlag) {
        const allDeliveryTurnArounds = await getTurnAroundForCents20(store);
        turnAround = Math.max(
            selectedServices.includes(serviceCategoryTypes.LAUNDRY)
                ? allDeliveryTurnArounds.laundryTurnAroundInHours
                : null,
            selectedServices.includes(serviceCategoryTypes.DRY_CLEANING)
                ? allDeliveryTurnArounds.dryCleaningTurnAroundInHours
                : null,
        );
    } else {
        turnAround = store.settings.turnAroundInHours;
    }

    return turnAround;
}

module.exports = { getTurnAroundByStore };
