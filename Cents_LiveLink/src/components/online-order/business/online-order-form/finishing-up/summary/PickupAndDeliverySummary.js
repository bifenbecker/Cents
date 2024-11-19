import React from "react";
import {Flex, Text} from "rebass/styled-components";

import {onlineOrderState} from "../../../../../../state/online-order";
import {sectionStyles} from "../styles";
import useToggle from "../../../../../../hooks/useToggle";

import {CADriverFeeInfoPopup, PickupDeliveryOrderSummary} from "../../../../../common";

const PickupAndDeliverySummary = () => {
  const pickup = onlineOrderState?.orderDelivery?.pickup?.get();
  const delivery = onlineOrderState?.orderDelivery?.delivery?.get();
  const storeState = onlineOrderState?.storeState?.get();
  const subscription = onlineOrderState?.subscription?.get();

  const {isOpen: showCADeliveryPopup, toggle: toggleCADriverFeePopup} = useToggle();

  return (
    <>
      {Number(subscription?.recurringDiscountPercent) > 0 && (
        <Flex {...styles.section.link.otherPaidInfo}>
          <Text>Recurring Order Discount</Text>
          <Text>{subscription.recurringDiscountPercent}% off </Text>
        </Flex>
      )}
      <Flex {...styles.section.link.wrapper} {...styles.section.link.lastWrapper}>
        <Flex {...styles.section.link.dataWrapper}>
          <PickupDeliveryOrderSummary
            pickup={pickup}
            delivery={delivery}
            pickupDeliveryFee={pickup?.totalDeliveryCost}
            returnDeliveryFee={delivery?.totalDeliveryCost}
            pickupDeliveryTip={pickup?.courierTip ? Number(pickup?.courierTip) : 0}
            returnDeliveryTip={delivery?.courierTip ? Number(delivery?.courierTip) : 0}
            storeLocation={storeState}
            toggleCADriverFeePopup={toggleCADriverFeePopup}
          />
        </Flex>
      </Flex>
      <CADriverFeeInfoPopup isOpen={showCADeliveryPopup} close={toggleCADriverFeePopup} />
    </>
  );
};

const styles = {
  section: sectionStyles,
};

export default PickupAndDeliverySummary;
