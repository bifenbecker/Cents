import React from "react";
import {Flex, Image, Text, Box} from "rebass/styled-components";

import styles from "./index.styles";

import {DELIVERY_PROVIDERS} from "../../../constants/order";
import {toDollars, toDollarsOrFree, getFinalSubsidy} from "../../../utils";
import {InfoIcon} from "../../../assets/images";

const StandardSummary = props => {
  const {pickupProvider, deliveryProvider, pickupDeliveryFee, returnDeliveryFee} = props;

  return (
    <Flex {...styles.pickupDeliveryInfo}>
      <Flex>
        <Text>
          {pickupProvider && deliveryProvider
            ? "Pickup & Delivery"
            : pickupProvider
            ? "Pickup"
            : "Delivery"}
        </Text>
        {pickupDeliveryFee && returnDeliveryFee ? (
          <Text {...styles.textPaddingLeft}>
            {`(${toDollars((pickupDeliveryFee + returnDeliveryFee) / 2)} each way)`}
          </Text>
        ) : null}
      </Flex>
      <Text>
        {pickupProvider && deliveryProvider
          ? toDollarsOrFree(pickupDeliveryFee + returnDeliveryFee)
          : pickupProvider
          ? toDollarsOrFree(pickupDeliveryFee)
          : toDollarsOrFree(returnDeliveryFee)}
      </Text>
    </Flex>
  );
};

const OnDemandOrderSummary = props => {
  const {
    deliveryFee,
    driverTip,
    orderDelivery,
    storeLocation,
    toggleCADriverFeePopup,
    type,
  } = props;

  const {
    totalDeliveryCost,
    subsidyInCents,
    thirdPartyDeliveryCostInCents,
  } = orderDelivery;

  const thirdPartyDeliveryCost = Number(thirdPartyDeliveryCostInCents || 0) / 100;
  const laundrySubsidy = Number(subsidyInCents || 0) / 100;
  const finalLaundrySubsidy = getFinalSubsidy(laundrySubsidy, thirdPartyDeliveryCost);
  const tripCost = Number(totalDeliveryCost || 0) + Number(finalLaundrySubsidy || 0);

  return (
    <Box {...styles.fullWidth}>
      <Flex {...styles.onDemandPaidInfo}>
        <Text>On-Demand {type}</Text>
        <Text>{toDollars(deliveryFee)}</Text>
      </Flex>

      {tripCost ? (
        <Flex {...styles.italicText}>
          <Text>{`Trip cost: ${toDollars(tripCost)}`}</Text>
        </Flex>
      ) : null}

      {laundrySubsidy ? (
        <Flex {...styles.italicSubsidyText}>
          <Text>{`Subsidy: -${toDollars(finalLaundrySubsidy)}`}</Text>
        </Flex>
      ) : null}

      {["CA", "California"].includes(storeLocation) ? (
        <Flex {...styles.italicText}>
          <Flex {...styles.caDriverWrapper}>
            <Text>Includes CA Driver Fee: $2.00</Text>
            <Image src={InfoIcon} onClick={toggleCADriverFeePopup} />
          </Flex>
        </Flex>
      ) : null}

      {driverTip ? <DriverTip suffix={type} driverTip={driverTip} /> : null}
    </Box>
  );
};

const OnDemandSummaryForPickupAndDelivery = props => {
  const {
    pickupDeliveryFee,
    returnDeliveryFee,
    delivery,
    pickup,
    pickupDeliveryTip,
    returnDeliveryTip,
    storeLocation,
    toggleCADriverFeePopup,
  } = props;

  const pickupSubsidy = (pickup?.subsidyInCents || 0) / 100;
  const deliverySubsidy = (delivery?.subsidyInCents || 0) / 100;

  const thirdPartyPickupCost = (pickup?.thirdPartyDeliveryCostInCents || 0) / 100;
  const thirdPartyDeliveryCost = (delivery?.thirdPartyDeliveryCostInCents || 0) / 100;

  const finalPickupSubsidy = getFinalSubsidy(pickupSubsidy, thirdPartyPickupCost);
  const finalDeliverySubsidy = getFinalSubsidy(deliverySubsidy, thirdPartyDeliveryCost);

  const totalDeliveryCost =
    Number(pickupDeliveryFee || 0) + Number(returnDeliveryFee || 0);
  const pickupCost = Number(pickupDeliveryFee || 0) + finalPickupSubsidy;
  const deliveryCost = Number(returnDeliveryFee || 0) + finalDeliverySubsidy;
  const tripCost = pickupCost + deliveryCost;

  return (
    <Box {...styles.fullWidth}>
      <Flex {...styles.onDemandPaidInfo}>
        <Text>On-Demand Pickup & Delivery</Text>
        <Text>{toDollars(totalDeliveryCost)}</Text>
      </Flex>

      <Flex {...styles.italicText}>
        <Text>Trip cost: {toDollars(tripCost)}</Text>
        <Text {...styles.textPaddingLeft}>
          {pickupCost && deliveryCost
            ? `(~ ${toDollars(tripCost / 2)} each way)`
            : pickupCost
            ? `(pickup: ${toDollars(pickupCost)}, delivery: $0.00)`
            : deliveryCost
            ? `(pickup: $0.00, delivery: ${toDollars(deliveryCost)})`
            : null}
        </Text>
      </Flex>

      {finalPickupSubsidy || finalDeliverySubsidy ? (
        <Flex {...styles.italicSubsidyText}>
          <Text>Subsidy: -{toDollars(finalPickupSubsidy + finalDeliverySubsidy)}</Text>
          <Text {...styles.textPaddingLeft}>
            {finalPickupSubsidy && finalDeliverySubsidy
              ? `(-${toDollars(
                  (finalPickupSubsidy + finalDeliverySubsidy) / 2
                )} each way)`
              : finalPickupSubsidy
              ? `(pickup: -${toDollars(finalPickupSubsidy)}, delivery: $0.00)`
              : `(pickup: $0.00, delivery: -${toDollars(finalDeliverySubsidy)})`}
          </Text>
        </Flex>
      ) : null}

      {["CA", "California"].includes(storeLocation) ? (
        <Flex {...styles.italicText}>
          <Flex {...styles.caDriverWrapper}>
            <Text>Includes CA Driver Fee: $4.00 ($2.00 each way)</Text>
            <Image src={InfoIcon} onClick={toggleCADriverFeePopup} />
          </Flex>
        </Flex>
      ) : null}

      {returnDeliveryTip && pickupDeliveryTip ? (
        <>
          <Flex {...styles.onDemandPaidInfo}>
            <Text>Pickup & Delivery Driver Tips</Text>
            <Text>{toDollars(returnDeliveryTip + pickupDeliveryTip)}</Text>
          </Flex>

          <Flex {...styles.italicText}>
            <Text>Split evenly between both drivers</Text>
          </Flex>
        </>
      ) : pickupDeliveryTip ? (
        <DriverTip suffix="Pickup" driverTip={pickupDeliveryTip} />
      ) : returnDeliveryTip ? (
        <DriverTip suffix="Delivery" driverTip={returnDeliveryTip} />
      ) : null}
    </Box>
  );
};

const DriverTip = ({suffix, driverTip}) => {
  return (
    <Flex {...styles.otherPaidInfo}>
      <Text>{suffix} Driver Tip</Text>
      <Text>{toDollars(driverTip)}</Text>
    </Flex>
  );
};

const PickupDeliveryOrderSummary = props => {
  const {
    pickup,
    delivery,
    pickupDeliveryFee,
    returnDeliveryFee,
    pickupDeliveryTip,
    returnDeliveryTip,
    storeLocation,
    toggleCADriverFeePopup,
  } = props;

  const pickupProvider = pickup?.deliveryProvider;
  const deliveryProvider = delivery?.deliveryProvider;

  switch (true) {
    case !pickupProvider && deliveryProvider === DELIVERY_PROVIDERS.ownDriver:
      return (
        <StandardSummary
          pickupProvider={pickupProvider}
          deliveryProvider={deliveryProvider}
          pickupDeliveryFee={0}
          returnDeliveryFee={returnDeliveryFee}
        />
      );
    case !pickupProvider &&
      deliveryProvider &&
      deliveryProvider !== DELIVERY_PROVIDERS.ownDriver:
      return (
        <OnDemandOrderSummary
          type="Delivery"
          deliveryFee={returnDeliveryFee}
          driverTip={returnDeliveryTip}
          orderDelivery={delivery}
          storeLocation={storeLocation}
          toggleCADriverFeePopup={toggleCADriverFeePopup}
        />
      );
    case pickupProvider === DELIVERY_PROVIDERS.ownDriver &&
      (!deliveryProvider || deliveryProvider === DELIVERY_PROVIDERS.ownDriver):
      return (
        <StandardSummary
          pickupProvider={pickupProvider}
          deliveryProvider={deliveryProvider}
          pickupDeliveryFee={pickupDeliveryFee}
          returnDeliveryFee={returnDeliveryFee}
        />
      );
    case pickupProvider !== DELIVERY_PROVIDERS.ownDriver &&
      (!deliveryProvider || deliveryProvider === DELIVERY_PROVIDERS.ownDriver):
      return (
        <Box {...styles.fullWidth}>
          <OnDemandOrderSummary
            type="Pickup"
            deliveryFee={pickupDeliveryFee}
            driverTip={pickupDeliveryTip}
            orderDelivery={pickup}
            storeLocation={storeLocation}
            toggleCADriverFeePopup={toggleCADriverFeePopup}
          />
          {deliveryProvider ? (
            <StandardSummary
              deliveryProvider={deliveryProvider}
              pickupDeliveryFee={0}
              returnDeliveryFee={returnDeliveryFee}
            />
          ) : null}
        </Box>
      );
    case pickupProvider === DELIVERY_PROVIDERS.ownDriver &&
      deliveryProvider !== DELIVERY_PROVIDERS.ownDriver:
      return (
        <Box {...styles.fullWidth}>
          <StandardSummary
            pickupProvider={pickupProvider}
            pickupDeliveryFee={pickupDeliveryFee}
            returnDeliveryFee={0}
          />
          <OnDemandOrderSummary
            type="Delivery"
            deliveryFee={returnDeliveryFee}
            driverTip={returnDeliveryTip}
            orderDelivery={delivery}
            storeLocation={storeLocation}
            toggleCADriverFeePopup={toggleCADriverFeePopup}
          />
        </Box>
      );
    default:
      return (
        <OnDemandSummaryForPickupAndDelivery
          pickupDeliveryFee={pickupDeliveryFee}
          returnDeliveryFee={returnDeliveryFee}
          pickupDeliveryTip={pickupDeliveryTip}
          returnDeliveryTip={returnDeliveryTip}
          pickup={pickup}
          delivery={delivery}
          storeLocation={storeLocation}
          toggleCADriverFeePopup={toggleCADriverFeePopup}
        />
      );
  }
};

export default PickupDeliveryOrderSummary;
