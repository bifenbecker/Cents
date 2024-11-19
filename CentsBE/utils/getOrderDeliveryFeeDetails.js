const { ORDER_DELIVERY_TYPES, ORDER_TYPES, deliveryProviders } = require('../constants/constants');

function getCorrectSubsidyInCents(settings, orderType, orderDeliveryType) {
    return orderDeliveryType === ORDER_DELIVERY_TYPES.RETURN && orderType !== ORDER_TYPES.ONLINE
        ? Number(settings.returnOnlySubsidyInCents || 0)
        : Number(settings.subsidyInCents || 0);
}

function getThirdPartyDeliveryFeeDetails({ thirdPartyDelivery, settings, orderType, type }) {
    const subsidyInCents = getCorrectSubsidyInCents(settings || {}, orderType, type);

    return {
        thirdPartyDeliveryId: thirdPartyDelivery ? thirdPartyDelivery.id : null,
        thirdPartyDeliveryCostInCents: thirdPartyDelivery ? thirdPartyDelivery.fee : 0,
        totalDeliveryCost: thirdPartyDelivery
            ? Number(
                  Math.max(0, Number((Number(thirdPartyDelivery.fee) - subsidyInCents) / 100)),
              ).toFixed(2)
            : 0,
        subsidyInCents,
        trackingUrl: thirdPartyDelivery ? thirdPartyDelivery.delivery_tracking_url : null,
    };
}

function getOrderDeliveryFeeDetails({
    orderDelivery,
    thirdPartyDelivery,
    settings = {},
    orderType,
    deliveryFeeInfo,
}) {
    const isOwnDriver = orderDelivery.deliveryProvider === deliveryProviders.OWN_DRIVER;
    const ownDriverDeliveryFee = Math.ceil(deliveryFeeInfo?.ownDeliveryStore?.deliveryFeeInCents);

    return isOwnDriver
        ? {
              totalDeliveryCost: Number((ownDriverDeliveryFee / 100).toFixed(2)),
              thirdPartyDeliveryId: null,
              thirdPartyDeliveryCostInCents: 0,
              subsidyInCents: 0,
              trackingUrl: null,
          }
        : getThirdPartyDeliveryFeeDetails({
              settings,
              orderType,
              type: orderDelivery.type,
              thirdPartyDelivery,
          });
}

module.exports = {
    getThirdPartyDeliveryFeeDetails,
    getOrderDeliveryFeeDetails,
};
