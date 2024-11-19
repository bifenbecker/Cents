import React from "react";
import {Flex, Box, Text, Image} from "rebass";

import useToggle from "../../../../hooks/useToggle";
import styles from "./index.styles";

import {HorizontalThreeDotIcon} from "../../../../assets/images";
import {INTERVAL_DISPLAY} from "../../../../constants/subscriptions";

import {SimplePopover} from "../../../common";

const CardWithHeaderAndFooter = props => {
  const {
    isNextPickupCancelled,
    pickup,
    delivery,
    centsCustomerAddress,
    nextPickupDatetime,
    interval,
  } = props?.subscription;
  const {onClick, openCancelSubscriptionClick} = props;
  const {address1, city, firstLevelSubdivisionCode} = centsCustomerAddress || {};
  const {isOpen, toggle} = useToggle();

  const handleCancelSubscription = e => {
    e.preventDefault();
    e.stopPropagation();
    openCancelSubscriptionClick(props?.subscription);
  };

  return (
    <Box {...styles.cardWrapper} onClick={onClick}>
      <Flex {...styles.headerWrapper}>
        <Box>
          <Text {...styles.addressText}>{address1}</Text>
          <Text {...styles.addressText}>{`${city}, ${firstLevelSubdivisionCode}`}</Text>
        </Box>
        <SimplePopover
          label={<Image src={HorizontalThreeDotIcon} />}
          isOpen={isOpen}
          toggle={toggle}
          childrenStyles={styles.childrenStyles}
        >
          <Text {...styles.popoverItem} onClick={handleCancelSubscription}>
            Cancel Recurring
          </Text>
        </SimplePopover>
      </Flex>
      <Box {...styles.contentWrapper}>
        <Text {...styles.bluetext} {...styles.uppercase}>
          {/* TODO: Remove or condition */}
          {INTERVAL_DISPLAY[interval || 1]}
        </Text>
        <Box {...styles.contentContainer}>
          <Flex {...styles.textContainer}>
            <Text {...styles.headerText}>Pickup:</Text>
            <Text {...styles.text}>{pickup}</Text>
          </Flex>
          <Flex>
            <Text {...styles.headerText}>Delivery:</Text>
            <Text {...styles.text}>{delivery}</Text>
          </Flex>
        </Box>
      </Box>
      <Flex {...styles.footerWrapper}>
        {isNextPickupCancelled ? (
          <Text {...styles.normaltext} {...styles.redText}>
            Skipping next pickup
          </Text>
        ) : (
          <Text {...styles.normaltext}>{`Next pickup ${nextPickupDatetime}`}</Text>
        )}
      </Flex>
    </Box>
  );
};

export default CardWithHeaderAndFooter;
