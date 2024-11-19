const moment = require('moment');
const {
    injectOwnWindowsToDeliveryDays,
} = require('../uow/delivery/onlineOrder/injectOwnWindowsToDeliveryDays');
const findOnDemandDeliveryWindow = require('../uow/delivery/pickup/findOnDemandDeliveryWindow');
const generateDoorDashPickupEstimateUow = require('../uow/delivery/doordash/generateDoorDashPickupEstimateUow');
const Store = require('../models/store');
const { generateDeliveryDays } = require('../utils/liveLink/generateDeliveryDays');
const { getTurnAroundByStore } = require('../utils/liveLink/getTurnAroundByStore');
const { DELIVERY_TIMING_TYPES } = require('../constants/constants');

const getReturnWindowsService = async ({
    windowsEndTime,
    timeZone,
    storeId,
    zipCode,
    selectedServices,
    apiVersion,
    address,
}) => {
    const store = await Store.query().findById(storeId).withGraphFetched('[settings, ownDelivery]');

    const deliveryTurnAround = await getTurnAroundByStore(store, selectedServices, apiVersion);

    const deliveryStartTime = moment(windowsEndTime).add(deliveryTurnAround, 'hours');

    const deliveryDays = generateDeliveryDays({
        startTime: deliveryStartTime.valueOf(),
        timeZone,
        customerZipCode: zipCode,
    });
    await injectOwnWindowsToDeliveryDays({
        startDate: deliveryStartTime.valueOf(),
        timeZone,
        bufferTimeInHours: 0,
        deliveryFeeInCents: store.ownDelivery.deliveryFeeInCents,
        storeId: store.id,
        zipCode,
        serviceType: DELIVERY_TIMING_TYPES.RETURN,
        deliveryDays,
    });
    const { googlePlacesId } = JSON.parse(address);
    const { doorDashEstimate } = await generateDoorDashPickupEstimateUow({
        onDemandDeliveryStore: store,
        zipCode,
        googlePlacesId,
    });
    await findOnDemandDeliveryWindow({
        doorDashEstimate,
        googlePlacesId,
        timeZone,
        onDemandDeliveryStore: store,
        deliveryDays,
        windowsAvailableTime: deliveryStartTime,
    });

    return deliveryDays;
};

module.exports = { getReturnWindowsService };
